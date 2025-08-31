import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';
import * as mqtt from 'mqtt';
import { DailyReportsManager, DailyReportConfig } from './daily-reports';

export = (api: API) => {
  api.registerPlatform('homebridge-ahoy-dtu', 'AhoyDTU', AhoyDTUPlatform);
};

interface AhoyDTUConfig extends PlatformConfig {
  mqttHost?: string;
  mqttPort?: number;
  mqttUsername?: string;
  mqttPassword?: string;
  mqttTopic?: string;
  selectedDevices?: string[];
  discoverDevices?: boolean;
  usePreset?: string; // 'basic', 'detailed', 'individual-inverters'
  maxEnergyPerDay?: number; // For better energy percentage calculation
  offlineThresholdMinutes?: number; // Minutes before considering device offline
  usePowerOutlets?: boolean; // Use Outlet service for power measurements (shows actual Watts)
  dailyReports?: DailyReportConfig; // Daily solar reports configuration
}

class AhoyDTUPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  private mqttClient: mqtt.MqttClient | null = null;
  private discoveredDevices: Map<string, any> = new Map();
  private deviceData: Map<string, any> = new Map();
  private discoveryTimeout: ReturnType<typeof setTimeout> | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private deviceOfflineThreshold: number = 15 * 60 * 1000; // 15 minutes
  private lastDeviceActivity: Date = new Date();
  private isSystemOffline: boolean = false;
  private dailyReportsManager: DailyReportsManager | null = null;
  private configHash: string = ''; // Hash der aktuellen Konfiguration für Cache-Validierung

  constructor(
    public readonly log: Logger,
    public readonly config: AhoyDTUConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // Validate required configuration
    if (!this.config.mqttHost) {
      this.log.error('MQTT Host is required in configuration');
      return;
    }

    // Configuration hash will be generated in configureAccessory when first accessory is loaded

    // Set offline threshold from config (default 15 minutes)
    this.deviceOfflineThreshold = (this.config.offlineThresholdMinutes || 15) * 60 * 1000;
    this.log.info(`Device offline threshold set to ${this.config.offlineThresholdMinutes || 15} minutes`);

    // Initialize daily reports if enabled
    if (this.config.dailyReports?.enabled) {
      this.dailyReportsManager = new DailyReportsManager(
        this.config.dailyReports, 
        this.log, 
        this.Service, 
        this.Characteristic
      );
      this.log.info(`Daily reports enabled in ${this.config.dailyReports.language || 'en'} language`);
    }

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      this.connectMQTT();
      
      if (this.config.discoverDevices) {
        this.startDeviceDiscovery();
      } else if (this.config.usePreset) {
        this.setupPresetDevices();
      } else {
        this.setupSelectedDevices();
      }
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    // Check if configuration has changed before loading cached accessories
    if (!this.configHash) {
      // First time loading, generate hash
      this.configHash = this.generateConfigHash();
      this.log.info('Initial configuration hash generated:', this.configHash);
      this.log.info('Current config - usePowerOutlets:', this.config.usePowerOutlets);
    } else {
      // Check if configuration changed
      const currentHash = this.generateConfigHash();
      this.log.debug('Comparing config hashes - Current:', currentHash, 'Previous:', this.configHash);
      
      if (currentHash !== this.configHash) {
        this.log.warn('Configuration change detected in configureAccessory. Clearing cached accessories.');
        this.log.info('This ensures new service types (e.g., Outlet vs LightSensor) are properly applied.');
        
        // Clear all cached data
        this.accessories.length = 0;
        this.discoveredDevices.clear();
        this.deviceData.clear();
        
        // Update hash after clearing
        this.configHash = currentHash;
        
        this.log.info('Cache cleared successfully. New accessories will be created with updated configuration.');
        return; // Don't add the old accessory
      } else {
        this.log.debug('Configuration unchanged, hash matches:', this.configHash);
      }
    }
    
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  private connectMQTT() {
    if (!this.config.mqttHost) {
      this.log.error('Cannot connect to MQTT: Host not configured');
      return;
    }

    const mqttUrl = `mqtt://${this.config.mqttHost}:${this.config.mqttPort || 1883}`;
    
    const options: mqtt.IClientOptions = {
      username: this.config.mqttUsername,
      password: this.config.mqttPassword,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    };

    this.log.info('Connecting to MQTT broker:', mqttUrl);
    this.mqttClient = mqtt.connect(mqttUrl, options);

    this.mqttClient.on('connect', () => {
      this.log.info('Connected to MQTT broker');
      
      if (this.config.discoverDevices) {
        // Subscribe to all topics for discovery
        this.mqttClient!.subscribe('#', (err?: Error) => {
          if (err) {
            this.log.error('MQTT Subscribe error (discovery):', err);
          } else {
            this.log.info('Subscribed to all topics for device discovery');
          }
        });
      } else {
        // Subscribe only to selected device topics
        this.subscribeToSelectedDevices();
      }
    });

    this.mqttClient.on('message', (topic: string, message: Buffer) => {
      this.handleMqttMessage(topic, message.toString());
    });

    this.mqttClient.on('error', (error: Error) => {
      this.log.error('MQTT connection error:', error);
    });

    this.mqttClient.on('offline', () => {
      this.log.warn('MQTT client offline');
    });

    this.mqttClient.on('reconnect', () => {
      this.log.info('MQTT client reconnecting...');
    });
  }

  private handleMqttMessage(topic: string, message: string) {
    if (this.config.discoverDevices) {
      this.handleDiscoveryMessage(topic, message);
    } else {
      this.handleDeviceMessage(topic, message);
    }
  }

  private handleDiscoveryMessage(topic: string, message: string) {
    // During discovery, collect all available topics and their data
    if (!this.discoveredDevices.has(topic)) {
      this.log.info('Discovered device topic:', topic, '- Value:', message);
      
      const deviceInfo = {
        topic: topic,
        lastValue: message,
        lastSeen: new Date(),
        dataType: this.guessDataType(topic, message)
      };
      
      this.discoveredDevices.set(topic, deviceInfo);
    } else {
      // Update existing device info
      const device = this.discoveredDevices.get(topic)!;
      device.lastValue = message;
      device.lastSeen = new Date();
    }
  }

  private handleDeviceMessage(topic: string, message: string) {
    this.log.debug('Received MQTT message:', topic, message);
    
    // Update last activity timestamp
    this.lastDeviceActivity = new Date();
    
    // If we were offline, log that we're back online
    if (this.isSystemOffline) {
      this.log.info('AHOY-DTU device is back online - solar production may have resumed');
      this.isSystemOffline = false;
      // Update all accessories to reflect online status
      this.updateAccessories();
    }
    
    // Validate message
    if (!this.isValidMessage(topic, message)) {
      this.log.debug('Invalid message ignored:', topic, message);
      return;
    }
    
    // Store device data
    this.deviceData.set(topic, {
      value: message,
      timestamp: new Date()
    });

    // Update daily reports with power data
    if (this.dailyReportsManager && this.guessDataType(topic, message) === 'power') {
      const powerValue = parseFloat(message);
      if (!isNaN(powerValue) && powerValue >= 0) {
        this.dailyReportsManager.updatePowerData(powerValue);
      }
    }

    // Update accessories
    this.updateAccessories();
  }

  private isValidMessage(topic: string, message: string): boolean {
    // Skip empty messages
    if (!message || message.trim() === '') {
      return false;
    }

    // Skip obvious error messages
    const errorKeywords = ['error', 'failed', 'timeout', 'nan', 'null', 'undefined'];
    const messageLower = message.toLowerCase();
    if (errorKeywords.some(keyword => messageLower.includes(keyword))) {
      return false;
    }

    // Validate numeric data ranges
    const dataType = this.guessDataType(topic, message);
    const numericValue = parseFloat(message);
    
    if (!isNaN(numericValue)) {
      switch (dataType) {
        case 'power':
          return numericValue >= 0 && numericValue <= 10000; // 0-10kW reasonable range
        case 'energy':
          return numericValue >= 0 && numericValue <= 100000; // 0-100kWh reasonable range
        case 'temperature':
          return numericValue >= -40 && numericValue <= 100; // -40°C to 100°C
        case 'voltage':
          return numericValue >= 0 && numericValue <= 1000; // 0-1000V
        case 'current':
          return numericValue >= 0 && numericValue <= 100; // 0-100A
        case 'frequency':
          return numericValue >= 40 && numericValue <= 70; // 40-70Hz
        case 'efficiency':
          return numericValue >= 0 && numericValue <= 100; // 0-100%
        default:
          return true; // Allow other numeric values
      }
    }
    
    return true; // Allow non-numeric messages (status, etc.)
  }

  private guessDataType(topic: string, message: string): string {
    const topicLower = topic.toLowerCase();
    const value = parseFloat(message);
    
    // AHOY-DTU specific topic detection
    if (topicLower.includes('power') && !isNaN(value)) {
      return 'power';
    } else if (topicLower.includes('energy') && !isNaN(value)) {
      return 'energy';
    } else if (topicLower.includes('temperature') && !isNaN(value)) {
      return 'temperature';
    } else if (topicLower.includes('voltage') && !isNaN(value)) {
      return 'voltage';
    } else if (topicLower.includes('current') && !isNaN(value)) {
      return 'current';
    } else if (topicLower.includes('frequency') && !isNaN(value)) {
      return 'frequency';
    } else if (topicLower.includes('efficiency') && !isNaN(value)) {
      return 'efficiency';
    } else if (topicLower.includes('status') || topicLower.includes('reachable') || topicLower.includes('producing')) {
      return 'status';
    } else if (topicLower.includes('rssi') && !isNaN(value)) {
      return 'signal';
    } else if (!isNaN(value)) {
      return 'numeric';
    } else {
      return 'text';
    }
  }

  private startDeviceDiscovery() {
    this.log.info('Starting device discovery for 30 seconds...');
    
    // Clear previous discoveries
    this.discoveredDevices.clear();
    
    // Set discovery timeout
    this.discoveryTimeout = setTimeout(() => {
      this.completeDiscovery();
    }, 30000); // 30 seconds discovery
  }

  private completeDiscovery() {
    if (this.discoveryTimeout) {
      clearTimeout(this.discoveryTimeout);
      this.discoveryTimeout = null;
    }

    this.log.info('Device discovery completed. Found', this.discoveredDevices.size, 'devices:');
    
    // Log all discovered devices
    for (const [topic, device] of this.discoveredDevices.entries()) {
      this.log.info(`- ${topic} (${device.dataType}): ${device.lastValue}`);
    }
    
    this.log.info('Please update your config.json with selectedDevices array and set discoverDevices to false');
    this.log.info('Example selectedDevices: ["topic1", "topic2", "topic3"]');
  }

  private subscribeToSelectedDevices() {
    if (!this.config.selectedDevices || this.config.selectedDevices.length === 0) {
      this.log.warn('No selectedDevices configured. Please run discovery first.');
      return;
    }

    this.mqttClient!.subscribe(this.config.selectedDevices, (err?: Error) => {
      if (err) {
        this.log.error('MQTT Subscribe error (selected devices):', err);
      } else {
        this.log.info('Subscribed to selected device topics:', this.config.selectedDevices);
      }
    });
  }

  private setupPresetDevices() {
    const presets = {
      'basic': [
        'AHOY-DTU_TOTAL/power',
        'AHOY-DTU_TOTAL/energy_today',
        'AHOY-DTU_TOTAL/status'
      ],
      'detailed': [
        'AHOY-DTU_TOTAL/power',
        'AHOY-DTU_TOTAL/energy_today',
        'AHOY-DTU_TOTAL/energy_total',
        'AHOY-DTU_TOTAL/temperature',
        'AHOY-DTU_TOTAL/status',
        'AHOY-DTU_TOTAL/efficiency'
      ],
      'individual-inverters': [
        'AHOY-DTU_TOTAL/power',
        'AHOY-DTU_TOTAL/energy_today',
        'AHOY-DTU_TOTAL/status'
        // Individual inverter topics would be added during discovery
      ]
    };

    const presetName = this.config.usePreset || 'basic';
    const selectedTopics = presets[presetName as keyof typeof presets];
    
    if (!selectedTopics) {
      this.log.error(`Unknown preset: ${presetName}. Available presets: ${Object.keys(presets).join(', ')}`);
      return;
    }

    this.log.info(`Using preset configuration: ${presetName}`);
    this.log.info(`Selected topics: ${selectedTopics.join(', ')}`);

    // Subscribe to preset topics
    this.mqttClient!.subscribe(selectedTopics, (err?: Error) => {
      if (err) {
        this.log.error('MQTT Subscribe error (preset):', err);
      } else {
        this.log.info('Subscribed to preset device topics');
      }
    });

    // Create devices for preset topics
    const devices = selectedTopics.map(topic => {
      const dataType = this.guessDataType(topic, '');
      const deviceName = this.generateDeviceName(topic);
      let serviceType;
      const uniqueId = topic.replace(/[^a-zA-Z0-9]/g, '-');
      
      switch (dataType) {
        case 'power':
          serviceType = this.config.usePowerOutlets ? this.Service.Outlet : this.Service.LightSensor;
          break;
        case 'energy':
          serviceType = this.Service.HumiditySensor;
          break;
        case 'temperature':
          serviceType = this.Service.TemperatureSensor;
          break;
        case 'status':
          serviceType = this.Service.ContactSensor;
          break;
        default:
          serviceType = this.Service.LightSensor;
      }
      
      return {
        uniqueId,
        displayName: deviceName,
        serviceType,
        topic,
        dataType
      };
    });
    
    this.createAccessories(devices);
    
    // Create daily reports motion sensor if enabled
    if (this.dailyReportsManager) {
      this.createDailyReportsAccessory();
    }
  }

  private setupSelectedDevices() {
    if (!this.config.selectedDevices || this.config.selectedDevices.length === 0) {
      this.log.warn('No devices selected. Please run discovery first or configure selectedDevices.');
      return;
    }

    const devices = [];
    
    for (const topic of this.config.selectedDevices) {
      const dataType = this.guessDataType(topic, '');
      const deviceName = this.generateDeviceName(topic);
      
      let serviceType;
      let uniqueId = topic.replace(/[^a-zA-Z0-9]/g, '-');
      
      switch (dataType) {
        case 'power':
          serviceType = this.config.usePowerOutlets ? this.Service.Outlet : this.Service.LightSensor;
          break;
        case 'energy':
          serviceType = this.Service.HumiditySensor;
          break;
        case 'temperature':
          serviceType = this.Service.TemperatureSensor;
          break;
        case 'status':
          serviceType = this.Service.ContactSensor;
          break;
        case 'voltage':
        case 'current':
        case 'frequency':
        case 'efficiency':
        case 'signal':
          serviceType = this.Service.LightSensor; // Map to light sensor for numeric display
          break;
        default:
          serviceType = this.Service.LightSensor; // Default fallback
      }
      
      devices.push({
        uniqueId: uniqueId,
        displayName: deviceName,
        serviceType: serviceType,
        topic: topic,
        dataType: dataType
      });
    }
    
    this.createAccessories(devices);
    this.startHealthMonitoring();
    
    // Create daily reports motion sensor if enabled
    if (this.dailyReportsManager) {
      this.createDailyReportsAccessory();
    }
  }

  private startHealthMonitoring() {
    // Check device health every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.checkDeviceHealth();
    }, 5 * 60 * 1000);
    
    this.log.info('Started device health monitoring');
  }

  private checkDeviceHealth() {
    const now = new Date();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes for stale data warning
    const timeSinceLastActivity = now.getTime() - this.lastDeviceActivity.getTime();
    
    // Check if device has gone offline (no MQTT messages for configured threshold)
    if (timeSinceLastActivity > this.deviceOfflineThreshold && !this.isSystemOffline) {
      this.log.warn(`AHOY-DTU device appears to be offline - no data received for ${Math.round(timeSinceLastActivity / 60000)} minutes`);
      this.log.info('This is normal during evening/night or when there is no sunlight');
      this.isSystemOffline = true;
      
      // Update all accessories to show offline status
      this.updateAccessoriesOfflineStatus();
    }
    
    // Check individual device data staleness
    for (const [topic, data] of this.deviceData.entries()) {
      const lastUpdate = data.timestamp;
      const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
      
      if (timeSinceUpdate > staleThreshold && !this.isSystemOffline) {
        this.log.debug(`Topic ${topic} data is stale: ${Math.round(timeSinceUpdate / 60000)} minutes old`);
      }
    }
  }

  private generateDeviceName(topic: string): string {
    // Convert AHOY-DTU topic to readable name
    const parts = topic.split('/');
    
    if (parts.length >= 2) {
      const devicePart = parts[0]; // e.g., "AHOY-DTU_TOTAL" or "AHOY-DTU_123456"
      const valuePart = parts[1];  // e.g., "power", "energy_today"
      
      // Clean up device name
      let deviceName = devicePart
        .replace('AHOY-DTU_', '')
        .replace('_TOTAL', ' Total')
        .replace(/_/g, ' ');
      
      // Clean up value name
      let valueName = valuePart
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Handle special cases for better naming
      if (valueName === 'Energy Today') valueName = 'Daily Energy';
      if (valueName === 'Energy Total') valueName = 'Total Energy';
      if (deviceName === 'Total') deviceName = 'Solar';
      
      // Special naming for power devices when using outlets
      if (valueName === 'Power' && this.config.usePowerOutlets) {
        valueName = 'Power Switch'; // Clarify that it's a switch representation
      }
      
      return `${deviceName} ${valueName}`;
    }
    
    // Fallback for single-part topics
    return topic
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private updateAccessories() {
    for (const accessory of this.accessories) {
      const device = accessory.context.device;
      if (!device || !device.topic) continue;
      
      // If system is offline, show offline status
      if (this.isSystemOffline) {
        this.updateAccessoryOfflineStatus(accessory, device);
        continue;
      }
      
      const deviceData = this.deviceData.get(device.topic);
      if (!deviceData) continue;
      
      const value = deviceData.value;
      const numericValue = parseFloat(value);
      
      if (device.serviceType === this.Service.LightSensor) {
        const service = accessory.getService(this.Service.LightSensor);
        if (service) {
          const lightValue = isNaN(numericValue) ? 0.0001 : Math.max(0.0001, numericValue);
          service.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, lightValue);
        }
      } else if (device.serviceType === this.Service.Outlet) {
        const service = accessory.getService(this.Service.Outlet);
        if (service) {
          // Set outlet as "On" if producing power
          const isOn = !isNaN(numericValue) && numericValue > 0;
          service.updateCharacteristic(this.Characteristic.On, isOn);
          
          // Update outlet usage status
          const powerValue = isNaN(numericValue) ? 0 : Math.max(0, numericValue);
          service.updateCharacteristic(this.Characteristic.OutletInUse, isOn);
          
          // Log power value since outlets don't directly show wattage
          if (powerValue > 0) {
            this.log.info(`${accessory.displayName}: ${powerValue}W (${isOn ? 'Producing' : 'Not Producing'})`);
          }
        }
      } else if (device.serviceType === this.Service.ContactSensor) {
        const service = accessory.getService(this.Service.ContactSensor);
        if (service) {
          const isActive = !isNaN(numericValue) ? numericValue > 0 : 
            value.toLowerCase().includes('online') || value.toLowerCase().includes('ok');
          service.updateCharacteristic(this.Characteristic.ContactSensorState, 
            isActive ? this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : 
            this.Characteristic.ContactSensorState.CONTACT_DETECTED);
        }
      } else if (device.serviceType === this.Service.HumiditySensor) {
        const service = accessory.getService(this.Service.HumiditySensor);
        if (service) {
          let percentage;
          if (device.dataType === 'energy') {
            // Smart energy percentage calculation
            const maxDaily = this.config.maxEnergyPerDay || 10; // Default 10 kWh
            const energyValue = isNaN(numericValue) ? 0 : numericValue;
            // Convert Wh to kWh if needed
            const energyInKwh = energyValue > 100 ? energyValue / 1000 : energyValue;
            percentage = Math.min(100, Math.max(0, (energyInKwh / maxDaily) * 100));
          } else {
            percentage = isNaN(numericValue) ? 0 : Math.min(100, Math.max(0, numericValue));
          }
          service.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, percentage);
        }
      } else if (device.serviceType === this.Service.TemperatureSensor) {
        const service = accessory.getService(this.Service.TemperatureSensor);
        if (service) {
          const temperature = isNaN(numericValue) ? 20 : numericValue;
          service.updateCharacteristic(this.Characteristic.CurrentTemperature, temperature);
        }
      }
    }
  }

  private updateAccessoriesOfflineStatus() {
    for (const accessory of this.accessories) {
      const device = accessory.context.device;
      if (!device) continue;
      this.updateAccessoryOfflineStatus(accessory, device);
    }
  }

  private updateAccessoryOfflineStatus(accessory: PlatformAccessory, device: any) {
    if (device.serviceType === this.Service.LightSensor) {
      const service = accessory.getService(this.Service.LightSensor);
      if (service) {
        // Set power to 0 when offline
        service.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, 0.0001);
      }
    } else if (device.serviceType === this.Service.Outlet) {
      const service = accessory.getService(this.Service.Outlet);
      if (service) {
        // Set outlet as "Off" when offline (not producing)
        service.updateCharacteristic(this.Characteristic.On, false);
        service.updateCharacteristic(this.Characteristic.OutletInUse, false);
      }
    } else if (device.serviceType === this.Service.ContactSensor) {
      const service = accessory.getService(this.Service.ContactSensor);
      if (service) {
        // Show as "not producing" when offline
        service.updateCharacteristic(this.Characteristic.ContactSensorState, 
          this.Characteristic.ContactSensorState.CONTACT_DETECTED);
      }
    } else if (device.serviceType === this.Service.HumiditySensor) {
      const service = accessory.getService(this.Service.HumiditySensor);
      if (service) {
        // Keep last energy reading when offline (don't reset to 0)
        // This maintains the daily energy total even when device is offline
        const lastData = this.deviceData.get(device.topic);
        if (lastData && device.dataType === 'energy') {
          const maxDaily = this.config.maxEnergyPerDay || 10;
          const energyValue = parseFloat(lastData.value) || 0;
          const energyInKwh = energyValue > 100 ? energyValue / 1000 : energyValue;
          const percentage = Math.min(100, Math.max(0, (energyInKwh / maxDaily) * 100));
          service.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, percentage);
        }
      }
    } else if (device.serviceType === this.Service.TemperatureSensor) {
      const service = accessory.getService(this.Service.TemperatureSensor);
      if (service) {
        // Keep last temperature reading or set to ambient when offline
        const lastData = this.deviceData.get(device.topic);
        const temperature = lastData ? (parseFloat(lastData.value) || 20) : 20;
        service.updateCharacteristic(this.Characteristic.CurrentTemperature, temperature);
      }
    }
  }

  private createAccessories(devices: any[]) {
    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.uniqueId);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
        this.setupAccessory(existingAccessory, device);
      } else {
        this.log.info('Adding new accessory:', device.displayName);
        const accessory = new this.api.platformAccessory(device.displayName, uuid);
        accessory.context.device = device;
        this.setupAccessory(accessory, device);
        this.api.registerPlatformAccessories('homebridge-ahoy-dtu', 'AhoyDTU', [accessory]);
        this.accessories.push(accessory);
      }
    }
  }

  private setupAccessory(accessory: PlatformAccessory, device: any) {
    accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'AHOY-DTU')
      .setCharacteristic(this.Characteristic.Model, 'MQTT Device')
      .setCharacteristic(this.Characteristic.SerialNumber, device.uniqueId);

    // Remove existing service if it exists
    const existingService = accessory.getService(device.serviceType);
    if (existingService) {
      accessory.removeService(existingService);
    }

    const service = accessory.addService(device.serviceType, device.displayName);

    if (device.serviceType === this.Service.LightSensor) {
      service.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel)
        .onGet(() => {
          if (this.isSystemOffline) {
            return 0.0001; // Show minimal value when offline
          }
          const deviceData = this.deviceData.get(device.topic);
          if (deviceData) {
            const value = parseFloat(deviceData.value);
            return isNaN(value) ? 0.0001 : Math.max(0.0001, value);
          }
          return 0.0001;
        });
    } else if (device.serviceType === this.Service.Outlet) {
      // Configure outlet for power measurement
      service.getCharacteristic(this.Characteristic.On)
        .onGet(() => {
          if (this.isSystemOffline) {
            return false; // Outlet "off" when offline
          }
          const deviceData = this.deviceData.get(device.topic);
          if (deviceData) {
            const value = parseFloat(deviceData.value);
            return !isNaN(value) && value > 0;
          }
          return false;
        })
        .onSet((value) => {
          // Outlet switch is read-only for solar power - ignore set attempts
          this.log.debug('Ignoring outlet set request - solar power is read-only');
        });
      
      service.getCharacteristic(this.Characteristic.OutletInUse)
        .onGet(() => {
          if (this.isSystemOffline) {
            return false;
          }
          const deviceData = this.deviceData.get(device.topic);
          if (deviceData) {
            const value = parseFloat(deviceData.value);
            return !isNaN(value) && value > 0;
          }
          return false;
        });
    } else if (device.serviceType === this.Service.ContactSensor) {
      service.getCharacteristic(this.Characteristic.ContactSensorState)
        .onGet(() => {
          if (this.isSystemOffline) {
            return this.Characteristic.ContactSensorState.CONTACT_DETECTED; // Not producing when offline
          }
          const deviceData = this.deviceData.get(device.topic);
          if (deviceData) {
            const numericValue = parseFloat(deviceData.value);
            const isActive = !isNaN(numericValue) ? numericValue > 0 : 
              deviceData.value.toLowerCase().includes('online') || deviceData.value.toLowerCase().includes('ok');
            return isActive ? 
              this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : 
              this.Characteristic.ContactSensorState.CONTACT_DETECTED;
          }
          return this.Characteristic.ContactSensorState.CONTACT_DETECTED;
        });
    } else if (device.serviceType === this.Service.HumiditySensor) {
      service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
        .onGet(() => {
          const deviceData = this.deviceData.get(device.topic);
          if (deviceData) {
            const value = parseFloat(deviceData.value);
            return isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
          }
          return 0;
        });
    } else if (device.serviceType === this.Service.TemperatureSensor) {
      service.getCharacteristic(this.Characteristic.CurrentTemperature)
        .onGet(() => {
          const deviceData = this.deviceData.get(device.topic);
          if (deviceData) {
            const value = parseFloat(deviceData.value);
            return isNaN(value) ? 20 : value;
          }
          return 20;
        });
    }
  }

  private createDailyReportsAccessory() {
    const uniqueId = 'ahoy-dtu-daily-reports';
    const uuid = this.api.hap.uuid.generate(uniqueId);
    const displayName = 'Solar Daily Reports';
    
    let existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
    
    if (existingAccessory) {
      this.log.info('Restoring daily reports accessory from cache:', existingAccessory.displayName);
    } else {
      this.log.info('Creating new daily reports accessory:', displayName);
      existingAccessory = new this.api.platformAccessory(displayName, uuid);
      existingAccessory.context.device = {
        uniqueId: uniqueId,
        displayName: displayName,
        serviceType: this.Service.MotionSensor,
        topic: 'daily-reports',
        dataType: 'reports'
      };
      this.api.registerPlatformAccessories('homebridge-ahoy-dtu', 'AhoyDTU', [existingAccessory]);
      this.accessories.push(existingAccessory);
    }
    
    // Setup the motion sensor service
    this.setupDailyReportsAccessory(existingAccessory);
    
    // Register with daily reports manager
    if (this.dailyReportsManager) {
      this.dailyReportsManager.setReportAccessory(existingAccessory);
    }
  }

  private setupDailyReportsAccessory(accessory: PlatformAccessory) {
    accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'AHOY-DTU')
      .setCharacteristic(this.Characteristic.Model, 'Daily Reports')
      .setCharacteristic(this.Characteristic.SerialNumber, 'daily-reports-v1');

    // Remove existing service if it exists
    const existingService = accessory.getService(this.Service.MotionSensor);
    if (existingService) {
      accessory.removeService(existingService);
    }

    const service = accessory.addService(this.Service.MotionSensor, 'Solar Daily Reports');
    
    service.getCharacteristic(this.Characteristic.MotionDetected)
      .onGet(() => {
        // Motion detected indicates a report was triggered
        return false; // Reset after reading
      });
      
    this.log.info('Daily reports Motion Sensor configured for HomeKit notifications');
  }

  /**
   * Generates a hash of the current configuration to detect changes
   */
  private generateConfigHash(): string {
    const configString = JSON.stringify({
      mqttHost: this.config.mqttHost,
      mqttPort: this.config.mqttPort,
      mqttUsername: this.config.mqttUsername,
      mqttPassword: this.config.mqttPassword,
      mqttTopic: this.config.mqttTopic,
      selectedDevices: this.config.selectedDevices,
      discoverDevices: this.config.discoverDevices,
      usePreset: this.config.usePreset,
      maxEnergyPerDay: this.config.maxEnergyPerDay,
      offlineThresholdMinutes: this.config.offlineThresholdMinutes,
      usePowerOutlets: this.config.usePowerOutlets,
      dailyReports: this.config.dailyReports,
    });
    
    // Simple hash function for better performance
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }


}

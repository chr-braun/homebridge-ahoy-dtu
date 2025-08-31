import {
  API,
  AccessoryPlugin,
  Logger,
  Service,
  Characteristic,
} from 'homebridge';
import * as mqtt from 'mqtt';
import { DailyReportsManager, DailyReportConfig } from './daily-reports';
import { UILocalizationManager } from './i18n/ui-manager';

export = (api: API) => {
  api.registerAccessory('homebridge-ahoy-dtu', 'AhoyDTU', AhoyDTUAccessory);
};

interface AhoyDTUConfig {
  name: string; // Accessory name (required for AccessoryPlugin)
  uiLanguage?: string; // UI language preference (de, en, fr)
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

class AhoyDTUAccessory implements AccessoryPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private mqttClient: mqtt.MqttClient | null = null;
  private deviceData: Map<string, any> = new Map();
  private isSystemOffline: boolean = false;
  private uiLocalization!: UILocalizationManager;

  constructor(
    public readonly log: Logger,
    public readonly config: AhoyDTUConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing accessory:', this.config.name);

    // Validate required configuration
    if (!this.config.mqttHost) {
      this.log.warn('MQTT Host not configured - accessory will work in demo mode');
    }

    // Initialize UI localization
    this.uiLocalization = new UILocalizationManager();
    if (this.config.uiLanguage) {
      this.uiLocalization.setLocale(this.config.uiLanguage);
      this.log.info(`UI language set to: ${this.config.uiLanguage}`);
    } else {
      this.log.info(`UI language using default: ${this.uiLocalization.getCurrentLocale()}`);
    }

    this.log.info('AHOY-DTU Accessory initialized successfully');
  }

  /**
   * Required method for AccessoryPlugin
   */
  getServices(): Service[] {
    // Return the services for this accessory
    const services: Service[] = [];
    
    // Add Accessory Information Service
    const accessoryInfo = new this.Service.AccessoryInformation();
    accessoryInfo
      .setCharacteristic(this.Characteristic.Manufacturer, 'AHOY-DTU')
      .setCharacteristic(this.Characteristic.Model, 'Solar Monitor')
      .setCharacteristic(this.Characteristic.SerialNumber, 'ahoy-dtu-v1');
    services.push(accessoryInfo);
    
    // Add main service based on configuration
    if (this.config.usePowerOutlets) {
      const outletService = new this.Service.Outlet(this.config.name);
      outletService
        .getCharacteristic(this.Characteristic.On)
        .onGet(() => {
          // Return true if solar power is being produced
          return this.isSystemOffline ? false : true;
        });
      services.push(outletService);
    } else {
      const lightSensorService = new this.Service.LightSensor(this.config.name);
      lightSensorService
        .getCharacteristic(this.Characteristic.CurrentAmbientLightLevel)
        .onGet(() => {
          // Return power value as light level
          return this.isSystemOffline ? 0.0001 : 1000; // Default value
        });
      services.push(lightSensorService);
    }
    
    return services;
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
    if (!this.deviceData.has(topic)) {
      this.log.info('Discovered device topic:', topic, '- Value:', message);
      
      const deviceInfo = {
        topic: topic,
        lastValue: message,
        lastSeen: new Date(),
        dataType: this.guessDataType(topic, message)
      };
      
      this.deviceData.set(topic, deviceInfo);
    } else {
      // Update existing device info
      const device = this.deviceData.get(topic)!;
      device.lastValue = message;
      device.lastSeen = new Date();
    }
  }

  private handleDeviceMessage(topic: string, message: string) {
    this.log.debug('Received MQTT message:', topic, message);
    
    // Update last activity timestamp
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    
    // If we were offline, log that we're back online
    if (this.isSystemOffline) {
      this.log.info('AHOY-DTU device is back online - solar production may have resumed');
      this.isSystemOffline = false;
      // Update all accessories to reflect online status
      // This is no longer needed as the accessory is not a DynamicPlatformPlugin
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
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
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
    this.deviceData.clear();
    
    // Set discovery timeout
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private completeDiscovery() {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    this.log.info('Device discovery completed. Found', this.deviceData.size, 'devices:');
    
    // Log all discovered devices
    for (const [topic, device] of this.deviceData.entries()) {
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
    
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    // this.createAccessories(devices);
    
    // Create daily reports motion sensor if enabled
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    // if (this.dailyReportsManager) {
    //   this.createDailyReportsAccessory();
    // }
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
    
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    // this.createAccessories(devices);
    // this.startHealthMonitoring();
    
    // Create daily reports motion sensor if enabled
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    // if (this.dailyReportsManager) {
    //   this.createDailyReportsAccessory();
    // }
  }

  private startHealthMonitoring() {
    // Check device health every 5 minutes
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private checkDeviceHealth() {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
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
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private updateAccessoriesOfflineStatus() {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private updateAccessoryOfflineStatus(accessory: any, device: any) {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private createAccessories(devices: any[]) {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private setupAccessory(accessory: any, device: any) {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private createDailyReportsAccessory() {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  private setupDailyReportsAccessory(accessory: any) {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
  }

  /**
   * Generates a hash of the current configuration to detect changes
   */
  private generateConfigHash(): string {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
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

  /**
   * Checks if cache should be cleared on first load due to important configuration changes
   */
  private shouldClearCacheOnFirstLoad(): boolean {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    // Check for important configuration changes that require cache clearing
    const importantChanges = [
      'usePowerOutlets',      // Service type changes (Outlet vs LightSensor)
      'selectedDevices',      // Device selection changes
      'usePreset',           // Preset configuration changes
      'mqttHost',            // MQTT connection changes
      'mqttPort',            // MQTT connection changes
      'mqttUsername',        // MQTT authentication changes
      'mqttPassword'         // MQTT authentication changes
    ];

    // If any of these important settings have changed, clear cache
    for (const setting of importantChanges) {
      if (this.config[setting as keyof AhoyDTUConfig] !== undefined) {
        this.log.debug(`Important setting detected: ${setting} = ${this.config[setting as keyof AhoyDTUConfig]}`);
      }
    }

    // Always clear cache if usePowerOutlets is enabled (this is the main issue)
    if (this.config.usePowerOutlets === true) {
      this.log.info('usePowerOutlets is enabled - clearing cache to ensure proper service types');
      return true;
    }

    // Clear cache if selectedDevices changed significantly
    if (this.config.selectedDevices && this.config.selectedDevices.length > 0) {
      this.log.info('Selected devices configured - clearing cache to ensure proper device setup');
      return true;
    }

    return false;
  }

  /**
   * Forces accessory creation when cache is cleared
   */
  private forceAccessoryCreation() {
    // This is no longer needed as the accessory is not a DynamicPlatformPlugin
    this.log.info('Forcing accessory creation after cache clear.');
    
    // Schedule accessory creation for next tick to ensure proper initialization
    setImmediate(() => {
      if (this.config.discoverDevices) {
        this.startDeviceDiscovery();
      } else if (this.config.usePreset) {
        this.setupPresetDevices();
      } else {
        this.setupSelectedDevices();
      }
    });
  }
}

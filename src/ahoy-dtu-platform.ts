import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { AhoyDtuAccessory } from './ahoy-dtu-accessory';
import { I18nManager } from './i18n';
import * as mqtt from 'mqtt';

export class AhoyDtuPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  public readonly i18n: I18nManager;

  private mqttClient: mqtt.MqttClient | null = null;
  private deviceData: Map<string, any> = new Map();
  private discoveredTopics: Set<string> = new Set();
  private mqttConfig: any = null;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private offlineCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.i18n = new I18nManager(config.language || 'de');
    
    this.log.info(this.i18n.t('platform.initialized', 'AHOY-DTU Platform initialisiert'));

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Homebridge startete - initialisiere AHOY-DTU');
      this.loadMqttConfig();
      this.connectMqtt();
    });

    this.api.on('shutdown', () => {
      this.cleanup();
    });
  }

  /**
   * MQTT-Konfiguration laden
   */
  private loadMqttConfig(): void {
    try {
      const mqttConfig = this.config.mqtt;
      
      if (mqttConfig && mqttConfig.host) {
        this.mqttConfig = {
          host: mqttConfig.host,
          port: mqttConfig.port || 1883,
          username: mqttConfig.username,
          password: mqttConfig.password,
          clientId: mqttConfig.clientId || `homebridge-ahoy-dtu-${Math.random().toString(16).substr(2, 8)}`,
          keepalive: 60,
          reconnectPeriod: 5000,
          connectTimeout: 30 * 1000
        };
        this.log.info(`MQTT-Konfiguration geladen: ${mqttConfig.host}:${mqttConfig.port}`);
      } else {
        this.log.error('Keine MQTT-Konfiguration gefunden. Bitte konfiguriere die MQTT-Verbindung in der Homebridge-UI.');
        return;
      }
    } catch (error) {
      this.log.error('Fehler beim Laden der MQTT-Konfiguration:', error);
    }
  }

  /**
   * MQTT-Verbindung herstellen
   */
  private connectMqtt(): void {
    if (!this.mqttConfig) return;

    try {
      this.log.info('Verbinde mit MQTT-Broker...');
      
      this.mqttClient = mqtt.connect(this.mqttConfig);

      this.mqttClient.on('connect', () => {
        this.log.info('✅ MQTT verbunden');
        this.subscribeToTopics();
        this.startDiscovery();
        this.startOfflineCheck();
      });

      this.mqttClient.on('error', (error) => {
        this.log.error('❌ MQTT-Fehler:', error);
      });

      this.mqttClient.on('close', () => {
        this.log.warn('⚠️ MQTT-Verbindung geschlossen');
      });

      this.mqttClient.on('reconnect', () => {
        this.log.info('🔄 MQTT-Reconnect...');
      });

      this.mqttClient.on('message', (topic, message) => {
        this.handleMqttMessage(topic, message);
      });

    } catch (error) {
      this.log.error('Fehler beim Verbinden mit MQTT:', error);
    }
  }

  /**
   * MQTT-Topics abonnieren
   */
  private subscribeToTopics(): void {
    if (!this.mqttClient) return;

    // AHOY-DTU Topics abonnieren (ohne Wildcards)
    const topics = [
      'AHOY-DTU_TOTAL/power',
      'AHOY-DTU_TOTAL/energy_today',
      'AHOY-DTU_TOTAL/energy_total',
      'AHOY-DTU_TOTAL/temperature',
      'AHOY-DTU_TOTAL/status',
      'AHOY-DTU_TOTAL/voltage',
      'AHOY-DTU_TOTAL/current',
      'AHOY-DTU_TOTAL/efficiency',
      'AHOY-DTU_TOTAL/frequency',
      'AHOY-DTU_TOTAL/rssi',
      'AHOY-DTU_TOTAL/reachable',
      'AHOY-DTU_TOTAL/producing'
    ];

    topics.forEach(topic => {
      this.mqttClient!.subscribe(topic, (err) => {
        if (err) {
          this.log.error(`Fehler beim Abonnieren von ${topic}:`, err);
        } else {
          this.log.info(`📡 Abonniert: ${topic}`);
        }
      });
    });
  }

  /**
   * MQTT-Nachricht verarbeiten
   */
  private handleMqttMessage(topic: string, message: Buffer): void {
    try {
      const value = message.toString();
      this.log.debug(`📨 MQTT: ${topic} = ${value}`);

      // Topic zur Discovery-Liste hinzufügen
      this.discoveredTopics.add(topic);

      // Daten parsen und speichern
      const deviceId = this.extractDeviceId(topic);
      const parameter = this.extractParameter(topic);
      
      if (deviceId && parameter) {
        if (!this.deviceData.has(deviceId)) {
          this.deviceData.set(deviceId, {});
        }
        
        const deviceData = this.deviceData.get(deviceId);
        deviceData[parameter] = this.parseValue(value);
        deviceData.lastUpdate = new Date();
        deviceData.online = true;

        // Accessory aktualisieren
        this.updateAccessory(deviceId, deviceData);
      }

    } catch (error) {
      this.log.error('Fehler beim Verarbeiten der MQTT-Nachricht:', error);
    }
  }

  /**
   * Device ID aus Topic extrahieren
   */
  private extractDeviceId(topic: string): string | null {
    const match = topic.match(/^AHOY-DTU_([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Parameter aus Topic extrahieren
   */
  private extractParameter(topic: string): string | null {
    const parts = topic.split('/');
    return parts.length > 1 ? parts[1] : null;
  }

  /**
   * Wert parsen (String zu Number wenn möglich)
   */
  private parseValue(value: string): any {
    // Numerische Werte
    if (/^-?\d+\.?\d*$/.test(value)) {
      return parseFloat(value);
    }
    
    // Boolean-Werte
    if (value === '1' || value === 'true') return true;
    if (value === '0' || value === 'false') return false;
    
    // String-Werte
    return value;
  }

  /**
   * Accessory aktualisieren
   */
  private updateAccessory(deviceId: string, data: any): void {
    const accessory = this.accessories.find(acc => acc.context.deviceId === deviceId);
    if (accessory) {
      const ahoyAccessory = accessory.context.ahoyAccessory as AhoyDtuAccessory;
      if (ahoyAccessory) {
        ahoyAccessory.updateData(data);
      }
    }
  }

  /**
   * Topic Discovery starten
   */
  private startDiscovery(): void {
    if (this.config.discoverDevices) {
      this.log.info('🔍 Starte Topic Discovery...');
      
      this.discoveryInterval = setInterval(() => {
        this.createAccessoriesFromDiscoveredTopics();
      }, 30000); // Alle 30 Sekunden
    }
  }

  /**
   * Accessories aus entdeckten Topics erstellen
   */
  private createAccessoriesFromDiscoveredTopics(): void {
    const deviceIds = new Set<string>();
    
    this.discoveredTopics.forEach(topic => {
      const deviceId = this.extractDeviceId(topic);
      if (deviceId) {
        deviceIds.add(deviceId);
      }
    });

    deviceIds.forEach(deviceId => {
      if (!this.accessories.find(acc => acc.context.deviceId === deviceId)) {
        this.createAccessory(deviceId);
      }
    });
  }

  /**
   * Offline-Check starten
   */
  private startOfflineCheck(): void {
    const thresholdMinutes = this.config.offlineThresholdMinutes || 5;
    
    this.offlineCheckInterval = setInterval(() => {
      const now = new Date();
      const threshold = new Date(now.getTime() - thresholdMinutes * 60 * 1000);
      
      this.deviceData.forEach((data, deviceId) => {
        if (data.lastUpdate && data.lastUpdate < threshold) {
          data.online = false;
          this.updateAccessory(deviceId, data);
        }
      });
    }, 60000); // Alle Minute prüfen
  }

  /**
   * Accessory erstellen
   */
  private createAccessory(deviceId: string): void {
    const deviceName = deviceId === 'TOTAL' ? 'AHOY-DTU Gesamt' : `AHOY-DTU ${deviceId}`;
    const uuid = this.api.hap.uuid.generate(`ahoy-dtu-${deviceId}`);
    
    const accessory = new this.api.platformAccessory(deviceName, uuid);
    accessory.context.deviceId = deviceId;
    accessory.context.deviceType = 'ahoy-dtu';
    
    // AhoyDtuAccessory-Instanz erstellen (ohne circular reference)
    const ahoyAccessory = new AhoyDtuAccessory(this, accessory);
    
    // Nur notwendige Daten im Context speichern (keine circular references)
    accessory.context.ahoyAccessory = null; // Circular reference entfernen
    
    this.accessories.push(accessory);
    this.api.registerPlatformAccessories('homebridge-ahoy-dtu', 'AhoyDTU', [accessory]);
    
    this.log.info(`✅ Accessory erstellt: ${deviceName}`);
  }

  /**
   * Accessory aus Cache konfigurieren
   */
  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info('Accessory aus Cache wiederhergestellt:', accessory.displayName);
    this.accessories.push(accessory);
    
    // AhoyDtuAccessory-Instanz erstellen
    const ahoyAccessory = new AhoyDtuAccessory(this, accessory);
    accessory.context.ahoyAccessory = ahoyAccessory;
  }

  /**
   * Aufräumen beim Beenden
   */
  private cleanup(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }
    
    if (this.offlineCheckInterval) {
      clearInterval(this.offlineCheckInterval);
      this.offlineCheckInterval = null;
    }
    
    if (this.mqttClient) {
      this.mqttClient.end();
      this.mqttClient = null;
    }
  }
}

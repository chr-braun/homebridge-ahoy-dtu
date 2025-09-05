import { Logger, PlatformAccessory, Service, Characteristic } from 'homebridge';
import { AhoyDtuPlatform } from './ahoy-dtu-platform';

export class AhoyDtuAccessory {
  private powerService: Service | undefined;
  private temperatureService: Service | undefined;
  private energyService: Service | undefined;
  private statusService: Service | undefined;
  private voltageService: Service | undefined;
  private currentService: Service | undefined;
  private efficiencyService: Service | undefined;

  private currentValues: Map<string, any> = new Map();
  private readonly deviceId: string;
  private readonly log: Logger;

  constructor(
    private readonly platform: AhoyDtuPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.deviceId = accessory.context.deviceId;
    this.log = platform.log;

    // Accessory Information Service
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'AHOY-DTU')
      .setCharacteristic(this.platform.Characteristic.Model, 'Hoymiles Solar Inverter')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.deviceId)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, '2.0.0');

    this.createServices();
    this.setupEventHandlers();
  }

  private createServices(): void {
    const sensorConfig = this.platform.config.sensors || {};

    // Solarproduktion als Light Sensor (Watt als Lux)
    if (sensorConfig.power !== false) {
      this.powerService = this.accessory.getService('Solarproduktion') ||
        this.accessory.addService(this.platform.Service.LightSensor, 'Solarproduktion', 'solar-power');
      
      this.powerService.setCharacteristic(this.platform.Characteristic.Name, 'Solarproduktion');
      this.powerService.setCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, 0.0001);
    }

    // Temperatur als Temperature Sensor
    if (sensorConfig.temperature !== false) {
      this.temperatureService = this.accessory.getService('Temperatur') ||
        this.accessory.addService(this.platform.Service.TemperatureSensor, 'Temperatur', 'temperature');
      
      this.temperatureService.setCharacteristic(this.platform.Characteristic.Name, 'Temperatur');
      this.temperatureService.setCharacteristic(this.platform.Characteristic.CurrentTemperature, 20);
    }

    // Tagesenergie als Light Sensor (kWh als Lux)
    if (sensorConfig.energyToday !== false) {
      this.energyService = this.accessory.getService('Tagesenergie') ||
        this.accessory.addService(this.platform.Service.LightSensor, 'Tagesenergie', 'daily-energy');
      
      this.energyService.setCharacteristic(this.platform.Characteristic.Name, 'Tagesenergie');
      this.energyService.setCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, 0.0001);
    }

    // Status als Contact Sensor
    if (sensorConfig.status !== false) {
      this.statusService = this.accessory.getService('Status') ||
        this.accessory.addService(this.platform.Service.ContactSensor, 'Status', 'status');
      
      this.statusService.setCharacteristic(this.platform.Characteristic.Name, 'Status');
      this.statusService.setCharacteristic(this.platform.Characteristic.ContactSensorState, 
        this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }

    // Spannung als Light Sensor (Volt als Lux)
    if (sensorConfig.voltage === true) {
      this.voltageService = this.accessory.getService('Spannung') ||
        this.accessory.addService(this.platform.Service.LightSensor, 'Spannung', 'voltage');
      
      this.voltageService.setCharacteristic(this.platform.Characteristic.Name, 'Spannung');
      this.voltageService.setCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, 0.0001);
    }

    // Strom als Light Sensor (Ampere als Lux)
    if (sensorConfig.current === true) {
      this.currentService = this.accessory.getService('Strom') ||
        this.accessory.addService(this.platform.Service.LightSensor, 'Strom', 'current');
      
      this.currentService.setCharacteristic(this.platform.Characteristic.Name, 'Strom');
      this.currentService.setCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, 0.0001);
    }

    // Effizienz als Light Sensor (Prozent als Lux)
    if (sensorConfig.efficiency === true) {
      this.efficiencyService = this.accessory.getService('Effizienz') ||
        this.accessory.addService(this.platform.Service.LightSensor, 'Effizienz', 'efficiency');
      
      this.efficiencyService.setCharacteristic(this.platform.Characteristic.Name, 'Effizienz');
      this.efficiencyService.setCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, 0.0001);
    }
  }

  private setupEventHandlers(): void {
    const sensorConfig = this.platform.config.sensors || {};

    // Solarproduktion (Watt als Lux)
    if (sensorConfig.power !== false) {
      this.powerService?.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .on('get', (callback) => {
          const power = this.currentValues.get('power') || 0;
          const luxValue = Math.max(0.0001, Math.abs(power));
          callback(null, luxValue);
        });
    }

    // Temperatur
    if (sensorConfig.temperature !== false) {
      this.temperatureService?.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
        .on('get', (callback) => {
          const temperature = this.currentValues.get('temperature') || 20;
          callback(null, temperature);
        });
    }

    // Tagesenergie (kWh als Lux)
    if (sensorConfig.energyToday !== false) {
      this.energyService?.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .on('get', (callback) => {
          const energyToday = this.currentValues.get('energy_today') || 0;
          // Wh zu Lux konvertieren (1 Wh = 0.001 Lux)
          const luxValue = Math.max(0.0001, energyToday * 0.001);
          callback(null, luxValue);
        });
    }

    // Status
    if (sensorConfig.status !== false) {
      this.statusService?.getCharacteristic(this.platform.Characteristic.ContactSensorState)
        .on('get', (callback) => {
          const online = this.currentValues.get('online') || false;
          const state = online ? 
            this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED :
            this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
          callback(null, state);
        });
    }

    // Spannung (Volt als Lux)
    if (sensorConfig.voltage === true) {
      this.voltageService?.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .on('get', (callback) => {
          const voltage = this.currentValues.get('voltage') || 0;
          const luxValue = Math.max(0.0001, Math.abs(voltage));
          callback(null, luxValue);
        });
    }

    // Strom (Ampere als Lux)
    if (sensorConfig.current === true) {
      this.currentService?.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .on('get', (callback) => {
          const current = this.currentValues.get('current') || 0;
          const luxValue = Math.max(0.0001, Math.abs(current));
          callback(null, luxValue);
        });
    }

    // Effizienz (Prozent als Lux)
    if (sensorConfig.efficiency === true) {
      this.efficiencyService?.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
        .on('get', (callback) => {
          const efficiency = this.currentValues.get('efficiency') || 0;
          const luxValue = Math.max(0.0001, Math.abs(efficiency));
          callback(null, luxValue);
        });
    }
  }

  /**
   * Daten aktualisieren (wird von der Platform aufgerufen)
   */
  updateData(data: any): void {
    const sensorConfig = this.platform.config.sensors || {};
    
    // Alle Werte speichern
    Object.keys(data).forEach(key => {
      this.currentValues.set(key, data[key]);
    });

    // Solarproduktion (Watt als Lux)
    if (sensorConfig.power !== false && data.power !== undefined) {
      const luxValue = Math.max(0.0001, Math.abs(data.power));
      this.powerService?.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, luxValue);
    }

    // Temperatur
    if (sensorConfig.temperature !== false && data.temperature !== undefined) {
      this.temperatureService?.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, data.temperature);
    }

    // Tagesenergie (Wh als Lux)
    if (sensorConfig.energyToday !== false && data.energy_today !== undefined) {
      const luxValue = Math.max(0.0001, data.energy_today * 0.001);
      this.energyService?.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, luxValue);
    }

    // Status
    if (sensorConfig.status !== false && data.online !== undefined) {
      const state = data.online ? 
        this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED :
        this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
      this.statusService?.updateCharacteristic(this.platform.Characteristic.ContactSensorState, state);
    }

    // Spannung (Volt als Lux)
    if (sensorConfig.voltage === true && data.voltage !== undefined) {
      const luxValue = Math.max(0.0001, Math.abs(data.voltage));
      this.voltageService?.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, luxValue);
    }

    // Strom (Ampere als Lux)
    if (sensorConfig.current === true && data.current !== undefined) {
      const luxValue = Math.max(0.0001, Math.abs(data.current));
      this.currentService?.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, luxValue);
    }

    // Effizienz (Prozent als Lux)
    if (sensorConfig.efficiency === true && data.efficiency !== undefined) {
      const luxValue = Math.max(0.0001, Math.abs(data.efficiency));
      this.efficiencyService?.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, luxValue);
    }

    this.log.debug(`📊 ${this.deviceId} Daten aktualisiert:`, {
      power: data.power,
      temperature: data.temperature,
      energy_today: data.energy_today,
      online: data.online
    });
  }
}

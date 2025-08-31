import {
  API,
  AccessoryPlugin,
  Logger,
  Service,
  Characteristic,
} from 'homebridge';

export = (api: API) => {
  api.registerAccessory('homebridge-ahoy-dtu', 'AhoyDTU', AhoyDTUAccessory);
};

interface AhoyDTUConfig {
  name: string; // Accessory name (required for AccessoryPlugin)
  usePowerOutlets?: boolean; // Use Outlet service for power measurements (shows actual Watts)
}

class AhoyDTUAccessory implements AccessoryPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  constructor(
    public readonly log: Logger,
    public readonly config: AhoyDTUConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing accessory:', this.config.name);
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
          return true; // Demo mode - always on
        });
      services.push(outletService);
    } else {
      const lightSensorService = new this.Service.LightSensor(this.config.name);
      lightSensorService
        .getCharacteristic(this.Characteristic.CurrentAmbientLightLevel)
        .onGet(() => {
          // Return power value as light level
          return 1000; // Demo mode - default value
        });
      services.push(lightSensorService);
    }
    
    return services;
  }
}

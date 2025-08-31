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
      .setCharacteristic(this.Characteristic.Model, 'Balkonkraftwerk')
      .setCharacteristic(this.Characteristic.SerialNumber, 'ahoy-dtu-v1');
    services.push(accessoryInfo);
    
    // Add Light Sensor Service for Power Display (shows actual Watts!)
    const powerService = new this.Service.LightSensor(`${this.config.name} Power`);
    powerService
      .getCharacteristic(this.Characteristic.CurrentAmbientLightLevel)
      .onGet(() => {
        // Demo mode - 1000W = 1000 lux
        return 1000;
      });
    services.push(powerService);
    
    // Add Humidity Sensor Service for Daily Energy (shows kWh as percentage)
    const dailyEnergyService = new this.Service.HumiditySensor(`${this.config.name} Daily Energy`);
    dailyEnergyService
      .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
      .onGet(() => {
        // Demo mode - 50% (5 kWh of 10 kWh max)
        return 50;
      });
    services.push(dailyEnergyService);
    
    // Add Temperature Sensor Service for Total Energy (shows total kWh as temperature)
    const totalEnergyService = new this.Service.TemperatureSensor(`${this.config.name} Total Energy`);
    totalEnergyService
      .getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(() => {
        // Demo mode - 25°C (5 kWh total)
        return 25;
      });
    services.push(totalEnergyService);
    
    // Add Outlet Service as status indicator
    if (this.config.usePowerOutlets) {
      const outletService = new this.Service.Outlet(`${this.config.name} Status`);
      outletService
        .getCharacteristic(this.Characteristic.On)
        .onGet(() => {
          // Demo mode - always producing power
          return true;
        });
      services.push(outletService);
    }
    
    return services;
  }
}

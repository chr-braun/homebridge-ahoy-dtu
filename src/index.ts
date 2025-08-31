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
    
    // Try to create Energy Provider Service if available
    try {
      // @ts-ignore - Check if EnergyProvider service exists
      if (this.Service.EnergyProvider) {
        this.log.info('🎉 Energy Provider Service verfügbar! Verwende native Apple Home Integration!');
        
        // @ts-ignore - Create EnergyProvider service
        const energyProviderService = new this.Service.EnergyProvider(this.config.name);
        
        // Try to add CurrentPower characteristic
        try {
          // @ts-ignore - Check if CurrentPower characteristic exists
          if (this.Characteristic.CurrentPower) {
            energyProviderService
              // @ts-ignore - Add CurrentPower characteristic
              .getCharacteristic(this.Characteristic.CurrentPower)
              .onGet(() => {
                this.log.info('⚡ CurrentPower: 1000W');
                return 1000; // Demo mode - 1000W
              });
          }
        } catch (e) {
          this.log.warn('CurrentPower Characteristic nicht verfügbar');
        }
        
        // Try to add DailyEnergy characteristic
        try {
          // @ts-ignore - Check if DailyEnergy characteristic exists
          if (this.Characteristic.DailyEnergy) {
            energyProviderService
              // @ts-ignore - Add DailyEnergy characteristic
              .getCharacteristic(this.Characteristic.DailyEnergy)
              .onGet(() => {
                this.log.info('📊 DailyEnergy: 5 kWh');
                return 5; // Demo mode - 5 kWh
              });
          }
        } catch (e) {
          this.log.warn('DailyEnergy Characteristic nicht verfügbar');
        }
        
        // Try to add TotalEnergy characteristic
        try {
          // @ts-ignore - Check if TotalEnergy characteristic exists
          if (this.Characteristic.TotalEnergy) {
            energyProviderService
              // @ts-ignore - Add TotalEnergy characteristic
              .getCharacteristic(this.Characteristic.TotalEnergy)
              .onGet(() => {
                this.log.info('🔋 TotalEnergy: 100 kWh');
                return 100; // Demo mode - 100 kWh
              });
          }
        } catch (e) {
          this.log.warn('TotalEnergy Characteristic nicht verfügbar');
        }
        
        services.push(energyProviderService);
        this.log.info('✅ Energy Provider Service erfolgreich erstellt!');
        
      } else {
        throw new Error('EnergyProvider Service nicht verfügbar');
      }
      
    } catch (error) {
      this.log.warn('⚠️ Energy Provider Service nicht verfügbar, verwende Fallback-Lösung');
      
      // Fallback: Light Sensor Service für Power Display (shows actual Watts!)
      const powerService = new this.Service.LightSensor(`${this.config.name} Power`);
      powerService
        .getCharacteristic(this.Characteristic.CurrentAmbientLightLevel)
        .onGet(() => {
          // Demo mode - 1000W = 1000 lux
          return 1000;
        });
      services.push(powerService);
      
      // Fallback: Humidity Sensor Service für Daily Energy (shows kWh als %)
      const dailyEnergyService = new this.Service.HumiditySensor(`${this.config.name} Daily Energy`);
      dailyEnergyService
        .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
        .onGet(() => {
          // Demo mode - 50% (5 kWh von 10 kWh max)
          return 50;
        });
      services.push(dailyEnergyService);
      
      // Fallback: Temperature Sensor Service für Total Energy (shows total kWh als Temperatur)
      const totalEnergyService = new this.Service.TemperatureSensor(`${this.config.name} Total Energy`);
      totalEnergyService
        .getCharacteristic(this.Characteristic.CurrentTemperature)
        .onGet(() => {
          // Demo mode - 25°C (5 kWh total)
          return 25;
        });
      services.push(totalEnergyService);
    }
    
    // Add Outlet Service als Status-Indikator
    if (this.config.usePowerOutlets) {
      const outletService = new this.Service.Outlet(`${this.config.name} Status`);
      outletService
        .getCharacteristic(this.Characteristic.On)
        .onGet(() => {
          // Demo mode - immer Strom produzierend
          return true;
        });
      services.push(outletService);
    }
    
    return services;
  }
}

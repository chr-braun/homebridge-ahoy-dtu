import { Service, PlatformAccessory, Characteristic } from 'homebridge';

export class KostalInverterAccessory {
  private mainService!: Service;
  private stringServices: Service[] = [];

  constructor(
    private readonly accessory: PlatformAccessory,
    private readonly device: any,
    private readonly serviceClass: typeof Service,
    private readonly characteristicClass: typeof Characteristic,
  ) {
    this.setupAccessory();
  }

  private setupAccessory() {
    // Setze Accessory-Informationen
    this.accessory.getService(this.serviceClass.AccessoryInformation)!
      .setCharacteristic(this.characteristicClass.Manufacturer, 'Kostal')
      .setCharacteristic(this.characteristicClass.Model, 'Plenticore')
      .setCharacteristic(this.characteristicClass.SerialNumber, this.device.serialNumber);

    if (this.device.type === 'main') {
      this.setupMainAccessory();
    } else if (this.device.type === 'string') {
      this.setupStringAccessory();
    }
  }

  private setupMainAccessory() {
    // Hauptwechselrichter - Light Sensor für Leistung
    this.mainService = this.accessory.addService(this.serviceClass.LightSensor, this.device.name);
    
    // Setze initiale Werte
    this.mainService.setCharacteristic(this.characteristicClass.CurrentAmbientLightLevel, 0);
  }

  private setupStringAccessory() {
    // PV-String - Light Sensor für Spannung
    this.mainService = this.accessory.addService(this.serviceClass.LightSensor, this.device.name);
    
    // Setze initiale Werte
    this.mainService.setCharacteristic(this.characteristicClass.CurrentAmbientLightLevel, 0);
  }

  // Update-Methoden
  updatePowerData(power: number) {
    if (this.device.type === 'main' && this.mainService) {
      this.mainService.updateCharacteristic(this.characteristicClass.CurrentAmbientLightLevel, power);
    }
  }

  updateVoltageData(voltage: number) {
    if (this.device.type === 'string' && this.mainService) {
      this.mainService.updateCharacteristic(this.characteristicClass.CurrentAmbientLightLevel, voltage);
    }
  }

  // Getter für Service (wird von der Platform benötigt)
  getMainService(): Service | undefined {
    return this.mainService;
  }
}

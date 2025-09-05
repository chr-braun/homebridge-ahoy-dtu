/**
 * iOS-kompatible Push-Benachrichtigungen
 * Verwendet HomeKit-Integration für iOS-Benachrichtigungen
 */

import { Service, Characteristic } from 'homebridge';

export class IOSPushService {
  private api: any;
  private log: any;
  private pushAccessory: any = null;

  constructor(api: any, log: any) {
    this.api = api;
    this.log = log;
  }

  async setupPushAccessory() {
    try {
      // Erstelle ein virtuelles Accessory für Push-Benachrichtigungen
      const uuid = this.api.hap.uuid.generate('kostal-push-notifications');
      const accessoryName = 'Kostal Solar Report';
      
      // Prüfe ob Accessory bereits existiert
      const existingAccessory = this.api.platformAccessory(accessoryName, uuid);
      
      if (!existingAccessory) {
        this.log.info('📱 Erstelle iOS Push-Accessory...');
        
        // Erstelle neues Accessory
        this.pushAccessory = new this.api.platformAccessory(accessoryName, uuid);
        
        // Setze Kategorie für Benachrichtigungen
        this.pushAccessory.category = this.api.hap.Categories.SENSOR;
        
        // Erstelle Service für Benachrichtigungen
        const notificationService = this.pushAccessory.addService(
          this.api.hap.Service.MotionSensor, 
          'Solar Report', 
          'solar-report'
        );
        
        // Erstelle zusätzlichen Service für Status
        const statusService = this.pushAccessory.addService(
          this.api.hap.Service.ContactSensor,
          'Report Status',
          'report-status'
        );
        
        // Setze initiale Werte
        notificationService.setCharacteristic(
          this.api.hap.Characteristic.MotionDetected, 
          false
        );
        
        statusService.setCharacteristic(
          this.api.hap.Characteristic.ContactSensorState,
          this.api.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
        );
        
        // Registriere Accessory
        this.api.registerPlatformAccessories('homebridge-kostal-inverter', 'KostalInverter', [this.pushAccessory]);
        
        this.log.info('✅ iOS Push-Accessory erstellt');
      } else {
        this.pushAccessory = existingAccessory;
        this.log.info('ℹ️ iOS Push-Accessory bereits vorhanden');
      }
      
      return this.pushAccessory;
    } catch (error) {
      this.log.error('❌ Fehler beim Erstellen des iOS Push-Accessories:', error);
      return null;
    }
  }

  async sendIOSNotification(report: any) {
    try {
      if (!this.pushAccessory) {
        await this.setupPushAccessory();
      }
      
      if (!this.pushAccessory) {
        this.log.error('❌ iOS Push-Accessory nicht verfügbar');
        return false;
      }
      
      // Aktiviere Motion Sensor für Benachrichtigung
      const motionService = this.pushAccessory.getService('Solar Report');
      if (motionService) {
        motionService.updateCharacteristic(
          this.api.hap.Characteristic.MotionDetected,
          true
        );
        
        // Nach kurzer Zeit wieder deaktivieren
        setTimeout(() => {
          motionService.updateCharacteristic(
            this.api.hap.Characteristic.MotionDetected,
            false
          );
        }, 2000);
      }
      
      // Aktualisiere Status Service
      const statusService = this.pushAccessory.getService('Report Status');
      if (statusService) {
        const status = report.status === 'SUCCESS' ? 
          this.api.hap.Characteristic.ContactSensorState.CONTACT_DETECTED :
          this.api.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
          
        statusService.updateCharacteristic(
          this.api.hap.Characteristic.ContactSensorState,
          status
        );
      }
      
      this.log.info('📱 iOS-Benachrichtigung gesendet');
      return true;
    } catch (error) {
      this.log.error('❌ Fehler beim Senden der iOS-Benachrichtigung:', error);
      return false;
    }
  }

  // Erstelle eine HomeKit-kompatible Nachricht
  formatHomeKitMessage(report: any): string {
    const emoji = report.status === 'SUCCESS' ? '🌞' : '🌙';
    const statusText = report.status === 'SUCCESS' ? 'Produktion' : 'Keine Produktion';
    
    let message = `${emoji} Kostal Solar Report - ${report.date}\n\n`;
    message += `⚡ Energie: ${report.total_energy_kwh.toFixed(3)} kWh\n`;
    message += `🔥 Max. Leistung: ${report.max_power_watts.toFixed(1)} W\n`;
    message += `🌡️ Temperatur: ${report.avg_temperature_celsius.toFixed(1)}°C\n`;
    message += `⏱️ Produktionszeit: ${report.production_hours.toFixed(2)}h\n`;
    message += `📊 Status: ${statusText}\n`;

    if (report.production_start && report.production_end) {
      const startTime = new Date(report.production_start).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
      const endTime = new Date(report.production_end).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
      message += `🌅 Start: ${startTime}\n`;
      message += `🌇 Ende: ${endTime}\n`;
    }

    // Vergleichswerte
    if (report.comparisons && Object.keys(report.comparisons).length > 0) {
      message += `\n📈 Vergleiche:\n`;
      
      if (report.comparisons.previous_day && report.comparisons.previous_day.available) {
        const diff = report.total_energy_kwh - report.comparisons.previous_day.energy_kwh;
        const trend = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
        message += `📅 Gestern: ${report.comparisons.previous_day.energy_kwh.toFixed(3)} kWh ${trend} ${diff > 0 ? '+' : ''}${diff.toFixed(3)} kWh\n`;
      }

      if (report.comparisons.week_average && report.comparisons.week_average.days_count > 0) {
        const diff = report.total_energy_kwh - report.comparisons.week_average.avg_energy_kwh;
        const trend = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
        message += `📊 Woche Ø: ${report.comparisons.week_average.avg_energy_kwh.toFixed(3)} kWh ${trend} ${diff > 0 ? '+' : ''}${diff.toFixed(3)} kWh\n`;
      }
    }

    return message;
  }
}

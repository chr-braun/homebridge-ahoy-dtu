/**
 * Einfache Push-Benachrichtigungen UI
 * Integriert in die Homebridge UI über config.schema.json
 */

export class SimplePushUI {
  private api: any;
  private log: any;
  private config: any;

  constructor(api: any, log: any, config: any) {
    this.api = api;
    this.log = log;
    this.config = config;
  }

  register() {
    this.log.info('📱 Push-Benachrichtigungen UI registriert');
    
    // Starte Push-Service wenn aktiviert
    this.api.on('didFinishLaunching', () => {
      this.startPushService();
    });
  }

  private startPushService() {
    try {
      // Prüfe ob Push-Benachrichtigungen in der Homebridge-Konfiguration aktiviert sind
      if (this.config.pushNotifications && this.config.pushNotifications.enabled) {
        this.log.info('📱 Push-Benachrichtigungen aktiviert über Homebridge UI');
        
        // Konvertiere Homebridge-Konfiguration zu Push-Service-Format
        const pushConfig = this.convertHomebridgeConfigToPushConfig();
        
        // Speichere Konfiguration
        this.savePushConfig(pushConfig);
        
        // Starte geplanten Service
        const PushNotificationService = require('../push-notifications.js');
        const pushService = new PushNotificationService();
        pushService.scheduleDailyReport();
      } else {
        this.log.info('ℹ️ Push-Benachrichtigungen deaktiviert');
      }
    } catch (error) {
      this.log.error('❌ Fehler beim Starten des Push-Services:', error);
    }
  }

  private convertHomebridgeConfigToPushConfig() {
    const pushConfig = this.config.pushNotifications || {};
    
    return {
      enabled: pushConfig.enabled || false,
      time: pushConfig.time || "20:00",
      services: {
        pushover: {
          enabled: pushConfig.services?.pushover?.enabled || false,
          userKey: pushConfig.services?.pushover?.userKey || "",
          appToken: pushConfig.services?.pushover?.appToken || ""
        },
        telegram: {
          enabled: pushConfig.services?.telegram?.enabled || false,
          botToken: pushConfig.services?.telegram?.botToken || "",
          chatId: pushConfig.services?.telegram?.chatId || ""
        },
        homekit: {
          enabled: pushConfig.services?.homekit?.enabled || false,
          accessoryName: pushConfig.services?.homekit?.accessoryName || "Kostal Solar Report"
        },
        webhook: {
          enabled: false,
          url: "",
          method: "POST"
        },
        email: {
          enabled: false,
          smtp: {
            host: "",
            port: 587,
            secure: false,
            auth: {
              user: "",
              pass: ""
            }
          },
          to: "",
          from: ""
        }
      }
    };
  }

  private savePushConfig(config: any) {
    try {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const configFile = path.join(os.homedir(), '.homebridge', 'kostal-push-config.json');
      const configDir = path.dirname(configFile);
      
      // Erstelle Verzeichnis falls nicht vorhanden
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Speichere Konfiguration
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      
      this.log.info('✅ Push-Konfiguration gespeichert');
    } catch (error) {
      this.log.error('❌ Fehler beim Speichern der Push-Konfiguration:', error);
    }
  }
}

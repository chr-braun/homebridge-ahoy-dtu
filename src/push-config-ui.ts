/**
 * Push-Benachrichtigungen UI für Homebridge
 * Integriert Push-Konfiguration in die Homebridge UI
 */

import { API } from 'homebridge';

export class PushConfigUI {
  private api: API;
  private log: any;

  constructor(api: API, log: any) {
    this.api = api;
    this.log = log;
  }

  register() {
    // Registriere UI-Route für Push-Konfiguration
    this.api.on('didFinishLaunching', () => {
      this.setupUIRoutes();
    });
  }

  private setupUIRoutes() {
    const express = require('express');
    const router = express.Router();

    // Push-Konfiguration laden
    router.get('/push-config', (req: any, res: any) => {
      try {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        const configFile = path.join(os.homedir(), '.homebridge', 'kostal-push-config.json');
        
        if (fs.existsSync(configFile)) {
          const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
          res.json(config);
        } else {
          // Standard-Konfiguration
          res.json({
            enabled: false,
            time: "20:00",
            services: {
              pushover: { enabled: false, userKey: "", appToken: "" },
              telegram: { enabled: false, botToken: "", chatId: "" },
              webhook: { enabled: false, url: "", method: "POST" },
              email: { enabled: false, smtp: { host: "", port: 587, secure: false, auth: { user: "", pass: "" } }, to: "", from: "" },
              ios: { enabled: false, apns: { keyId: "", teamId: "", bundleId: "", keyPath: "" }, deviceTokens: [] },
              homekit: { enabled: false, homebridgeWebhook: "", accessoryName: "Kostal Solar Report" }
            }
          });
        }
      } catch (error) {
        this.log.error('❌ Fehler beim Laden der Push-Konfiguration:', error);
        res.status(500).json({ error: 'Konfiguration konnte nicht geladen werden' });
      }
    });

    // Push-Konfiguration speichern
    router.post('/push-config', (req: any, res: any) => {
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
        fs.writeFileSync(configFile, JSON.stringify(req.body, null, 2));
        
        this.log.info('✅ Push-Konfiguration gespeichert');
        res.json({ success: true });
      } catch (error) {
        this.log.error('❌ Fehler beim Speichern der Push-Konfiguration:', error);
        res.status(500).json({ error: 'Konfiguration konnte nicht gespeichert werden' });
      }
    });

    // Push-Benachrichtigung testen
    router.post('/push-test', async (req: any, res: any) => {
      try {
        const PushNotificationService = require('../push-notifications.js');
        const service = new PushNotificationService();
        
        // Generiere Test-Report
        const DailyReportGenerator = require('../generate-daily-report.js');
        const generator = new DailyReportGenerator();
        const report = await generator.generateDailyReport();
        
        // Sende Test-Benachrichtigung
        await service.sendPushNotification(report);
        
        res.json({ success: true, message: 'Test-Benachrichtigung gesendet' });
      } catch (error) {
        this.log.error('❌ Fehler beim Testen der Push-Benachrichtigung:', error);
        res.status(500).json({ error: 'Test-Benachrichtigung fehlgeschlagen' });
      }
    });

    // Registriere Route (vereinfachte Version)
    // this.api.registerRoute('kostal-push', router);
  }
}

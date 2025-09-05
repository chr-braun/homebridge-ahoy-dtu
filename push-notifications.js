#!/usr/bin/env node
/**
 * Push Notification System für Kostal Tagesreport
 * Unterstützt verschiedene Push-Services
 */

const DailyReportGenerator = require('./generate-daily-report.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PushNotificationService {
  constructor() {
    this.configFile = path.join(os.homedir(), '.homebridge', 'kostal-push-config.json');
    this.loadConfig();
  }

  loadConfig() {
    if (fs.existsSync(this.configFile)) {
      try {
        this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      } catch (error) {
        console.error('❌ Fehler beim Laden der Push-Konfiguration:', error);
        this.config = this.getDefaultConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
      this.saveConfig();
    }
  }

  getDefaultConfig() {
    return {
      enabled: false,
      time: "20:00",
      services: {
        pushover: {
          enabled: false,
          userKey: "",
          appToken: ""
        },
        telegram: {
          enabled: false,
          botToken: "",
          chatId: ""
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
        },
        ios: {
          enabled: false,
          apns: {
            keyId: "",
            teamId: "",
            bundleId: "",
            keyPath: ""
          },
          deviceTokens: []
        },
        homekit: {
          enabled: false,
          homebridgeWebhook: "",
          accessoryName: "Kostal Solar Report"
        }
      }
    };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
      console.log('✅ Push-Konfiguration gespeichert');
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Push-Konfiguration:', error);
    }
  }

  async sendPushNotification(report) {
    if (!this.config.enabled) {
      console.log('📱 Push-Benachrichtigungen sind deaktiviert');
      return;
    }

    const message = this.formatReportMessage(report);
    const promises = [];

    // Pushover
    if (this.config.services.pushover.enabled) {
      promises.push(this.sendPushover(message));
    }

    // Telegram
    if (this.config.services.telegram.enabled) {
      promises.push(this.sendTelegram(message));
    }

    // Webhook
    if (this.config.services.webhook.enabled) {
      promises.push(this.sendWebhook(report));
    }

    // Email
    if (this.config.services.email.enabled) {
      promises.push(this.sendEmail(report, message));
    }

    // HomeKit
    if (this.config.services.homekit.enabled) {
      promises.push(this.sendHomeKit(report));
    }

    try {
      await Promise.all(promises);
      console.log('✅ Push-Benachrichtigungen gesendet');
    } catch (error) {
      console.error('❌ Fehler beim Senden der Push-Benachrichtigungen:', error);
    }
  }

  formatReportMessage(report) {
    const emoji = report.status === 'SUCCESS' ? '🌞' : '🌙';
    const statusText = report.status === 'SUCCESS' ? 'Produktion' : 'Keine Produktion';
    
    let message = `${emoji} *Kostal Solar Report - ${report.date}*\n\n`;
    message += `⚡ *Energie:* ${report.total_energy_kwh.toFixed(3)} kWh\n`;
    message += `🔥 *Max. Leistung:* ${report.max_power_watts.toFixed(1)} W\n`;
    message += `🌡️ *Temperatur:* ${report.avg_temperature_celsius.toFixed(1)}°C\n`;
    message += `⏱️ *Produktionszeit:* ${report.production_hours.toFixed(2)}h\n`;
    message += `📊 *Status:* ${statusText}\n`;

    if (report.production_start && report.production_end) {
      const startTime = new Date(report.production_start).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
      const endTime = new Date(report.production_end).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
      message += `🌅 *Start:* ${startTime}\n`;
      message += `🌇 *Ende:* ${endTime}\n`;
    }

    // Vergleichswerte
    if (report.comparisons && Object.keys(report.comparisons).length > 0) {
      message += `\n📈 *Vergleiche:*\n`;
      
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

  async sendPushover(message) {
    const pushover = require('pushover-notifications');
    const p = new pushover({
      user: this.config.services.pushover.userKey,
      token: this.config.services.pushover.appToken
    });

    return new Promise((resolve, reject) => {
      p.send({
        message: message,
        title: 'Kostal Solar Report',
        sound: 'cosmic',
        priority: 0
      }, (err, result) => {
        if (err) {
          console.error('❌ Pushover Fehler:', err);
          reject(err);
        } else {
          console.log('✅ Pushover gesendet');
          resolve(result);
        }
      });
    });
  }

  async sendTelegram(message) {
    const axios = require('axios');
    
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.config.services.telegram.botToken}/sendMessage`,
        {
          chat_id: this.config.services.telegram.chatId,
          text: message,
          parse_mode: 'Markdown'
        }
      );
      
      if (response.data.ok) {
        console.log('✅ Telegram gesendet');
      } else {
        throw new Error(response.data.description);
      }
    } catch (error) {
      console.error('❌ Telegram Fehler:', error.message);
      throw error;
    }
  }

  async sendWebhook(report) {
    const axios = require('axios');
    
    try {
      const response = await axios({
        method: this.config.services.webhook.method,
        url: this.config.services.webhook.url,
        data: {
          timestamp: new Date().toISOString(),
          report: report,
          message: this.formatReportMessage(report)
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Webhook gesendet');
    } catch (error) {
      console.error('❌ Webhook Fehler:', error.message);
      throw error;
    }
  }

  async sendEmail(report, message) {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter(this.config.services.email.smtp);
    
    const mailOptions = {
      from: this.config.services.email.from,
      to: this.config.services.email.to,
      subject: `Kostal Solar Report - ${report.date}`,
      text: message.replace(/\*/g, ''), // Entferne Markdown für Plain Text
      html: message.replace(/\n/g, '<br>').replace(/\*/g, '<b>').replace(/\*/g, '</b>')
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ E-Mail gesendet');
    } catch (error) {
      console.error('❌ E-Mail Fehler:', error.message);
      throw error;
    }
  }

  async sendHomeKit(report) {
    try {
      // Verwende HomeKit-Integration über Webhook
      if (this.config.services.homekit.homebridgeWebhook) {
        const axios = require('axios');
        
        const homeKitMessage = this.formatHomeKitMessage(report);
        
        const response = await axios.post(this.config.services.homekit.homebridgeWebhook, {
          accessoryName: this.config.services.homekit.accessoryName,
          message: homeKitMessage,
          report: report,
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ HomeKit-Benachrichtigung gesendet');
      } else {
        console.log('ℹ️ HomeKit-Webhook nicht konfiguriert');
      }
    } catch (error) {
      console.error('❌ HomeKit Fehler:', error.message);
      throw error;
    }
  }

  formatHomeKitMessage(report) {
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

  async scheduleDailyReport() {
    const cron = require('node-cron');
    
    // Parse Zeit (HH:MM)
    const [hours, minutes] = this.config.time.split(':').map(Number);
    
    // Cron Expression: Minuten Stunde * * *
    const cronExpression = `${minutes} ${hours} * * *`;
    
    console.log(`⏰ Täglicher Report geplant für ${this.config.time}`);
    
    cron.schedule(cronExpression, async () => {
      console.log(`📊 Generiere täglichen Report um ${new Date().toLocaleTimeString()}`);
      
      try {
        const generator = new DailyReportGenerator();
        const report = await generator.generateDailyReport();
        
        // Sende Push-Benachrichtigung
        await this.sendPushNotification(report);
        
        console.log('✅ Täglicher Report abgeschlossen');
      } catch (error) {
        console.error('❌ Fehler beim Generieren des täglichen Reports:', error);
      }
    }, {
      scheduled: true,
      timezone: "Europe/Berlin"
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--setup')) {
    const service = new PushNotificationService();
    console.log('🔧 Push-Benachrichtigungen Setup');
    console.log('Konfigurationsdatei:', service.configFile);
    console.log('Bearbeite die Datei und setze "enabled": true für gewünschte Services');
    return;
  }
  
  if (args.includes('--test')) {
    const service = new PushNotificationService();
    const generator = new DailyReportGenerator();
    const report = await generator.generateDailyReport();
    await service.sendPushNotification(report);
    return;
  }
  
  if (args.includes('--schedule')) {
    const service = new PushNotificationService();
    await service.scheduleDailyReport();
    
    console.log('⏰ Push-Benachrichtigungen geplant');
    console.log('Drücke Ctrl+C zum Beenden');
    
    // Halte den Prozess am Leben
    process.on('SIGINT', () => {
      console.log('\n🛑 Push-Service beendet');
      process.exit(0);
    });
    
    return;
  }
  
  console.log('📱 Kostal Push Notification Service');
  console.log('Verwendung:');
  console.log('  --setup     Zeige Setup-Anweisungen');
  console.log('  --test      Teste Push-Benachrichtigungen');
  console.log('  --schedule  Starte geplanten Service');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PushNotificationService;

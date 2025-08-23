# 🌍 Multi-Language Daily Solar Reports

The AHOY-DTU plugin now features **comprehensive multi-language support** for daily solar production reports! Get personalized end-of-day summaries in **5 languages** with intelligent analytics and HomeKit integration.

## 🚀 Supported Languages

| Language | Code | Native Name | Sample Message |
|----------|------|-------------|----------------|
| **🇺🇸 English** | `en` | English | "Solar production complete for today • Generated: 12.5 kWh (83% of target) • Peak: 4.2 kW at 13:15 • +15% vs yesterday" |
| **🇩🇪 German** | `de` | Deutsch | "Solarproduktion für heute abgeschlossen • Erzeugt: 12,5 kWh (83% des Ziels) • Spitze: 4,2 kW um 13:15 • +15% im Vergleich zu gestern" |
| **🇫🇷 French** | `fr` | Français | "Production solaire terminée pour aujourd'hui • Générée: 12,5 kWh (83% de l'objectif) • Pic: 4,2 kW à 13:15 • +15% par rapport à hier" |
| **🇮🇹 Italian** | `it` | Italiano | "Produzione solare completata per oggi • Generata: 12,5 kWh (83% dell'obiettivo) • Picco: 4,2 kW alle 13:15 • +15% rispetto a ieri" |
| **🇨🇳 Chinese** | `zh` | 中文 | "今日太阳能发电完成 • 发电量：12.5 千瓦时（目标的83%） • 峰值：4.2 千瓦 于 13:15 • 比昨日+15%" |

## ⚡ Quick Setup

### Basic Configuration
```json
{
  "platforms": [
    {
      "platform": "AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqttHost": "192.168.1.100",
      "usePreset": "basic",
      "dailyReports": {
        "enabled": true,
        "language": "de",
        "reportStyle": "motion",
        "reportTime": "sunset+30"
      }
    }
  ]
}
```

### Full Featured Configuration
```json
{
  "platforms": [
    {
      "platform": "AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqttHost": "192.168.1.100",
      "usePowerOutlets": true,
      "maxEnergyPerDay": 20.0,
      "dailyReports": {
        "enabled": true,
        "language": "fr",
        "reportStyle": "motion",
        "reportTime": "sunset+30",
        "includeComparisons": true
      }
    }
  ]
}
```

## 📱 HomeKit Integration

### Motion Sensor Delivery
Daily reports are delivered via a **Motion Sensor** in HomeKit that:
- ✅ Triggers motion detection when report is ready
- 📱 Sends push notifications to all devices
- 🏠 Works with HomeKit automations and scenes
- 👥 Supports family sharing

### How It Works
1. **Data Collection**: Plugin tracks solar power production throughout the day
2. **Smart Timing**: Reports trigger automatically at sunset or custom time
3. **Language Processing**: Generates localized message with cultural formatting
4. **HomeKit Delivery**: Motion sensor triggers, sending notification to all devices

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable daily reports |
| `language` | string | `"en"` | Language code (en, de, fr, it, zh) |
| `reportStyle` | string | `"motion"` | Delivery method: motion, doorbell, switch |
| `reportTime` | string | `"sunset+30"` | When to send: sunset, sunset+30, sunset+60, HH:MM |
| `includeComparisons` | boolean | `true` | Include yesterday and weekly comparisons |

### Report Timing Options
- `"sunset"` - At sunset (calculated automatically)
- `"sunset+30"` - 30 minutes after sunset
- `"sunset+60"` - 1 hour after sunset  
- `"20:00"` - Custom time (8:00 PM)
- `"21:30"` - Custom time (9:30 PM)

### Delivery Styles
- **Motion Sensor** (recommended): Reliable notifications, automation support
- **Doorbell**: Coming soon - doorbell press notifications
- **Switch**: Coming soon - programmable switch events

## 📊 Report Analytics

### Smart Data Tracking
- **Daily Energy**: Total kWh generated today
- **Peak Power**: Maximum instantaneous power and time
- **Production Hours**: Duration of active solar generation
- **Efficiency**: Percentage of target daily production
- **Weather Detection**: Sunny, partly cloudy, cloudy, mixed conditions

### Intelligent Comparisons
- **Yesterday**: Percentage difference from previous day
- **Weekly Average**: Comparison to last 7 days average
- **Trend Analysis**: Seasonal and weather-based insights

## 🌍 Localization Features

### Cultural Adaptations
- **Number Formatting**: Locale-specific decimal separators (12.5 vs 12,5)
- **Time Display**: 24-hour vs 12-hour format based on region
- **Unit Preferences**: kWh, kW displayed according to local conventions
- **Weather Descriptions**: Culturally appropriate weather terminology

### Technical Implementation
- **Unicode Support**: Full UTF-8 character encoding
- **Extensible System**: Easy to add new languages
- **Template Engine**: Flexible message customization
- **Format Validation**: Ensures consistent display across platforms

## 🛠️ Troubleshooting

### No Reports Received
1. ✅ Check `"enabled": true` in configuration
2. 🔍 Verify Motion Sensor exists in Home app
3. 📱 Ensure notifications enabled for the accessory
4. 📋 Check Homebridge logs for errors

### Wrong Language Display
1. 🔤 Verify language code is correct (en, de, fr, it, zh)
2. 🔄 Restart Homebridge after language changes
3. 📊 Check logs for language loading messages

### Missing Data
1. ⚡ Ensure power data is being received from MQTT
2. 🔌 Check MQTT connectivity
3. 📈 Verify energy tracking is working properly

## 📝 Example Report Messages

### English (en)
```
Solar production complete for today
• Generated: 15.2 kWh (76% of target)
• Peak: 3.8 kW at 12:45
• +8% vs yesterday
```

### German (de)
```
Solarproduktion für heute abgeschlossen
• Erzeugt: 15,2 kWh (76% des Ziels)
• Spitze: 3,8 kW um 12:45
• +8% im Vergleich zu gestern
```

### French (fr)
```
Production solaire terminée pour aujourd'hui
• Générée: 15,2 kWh (76% de l'objectif)
• Pic: 3,8 kW à 12:45
• +8% par rapport à hier
```

### Chinese (zh)
```
今日太阳能发电完成
• 发电量：15.2 千瓦时（目标的76%）
• 峰值：3.8 千瓦 于 12:45
• 比昨日+8%
```

## 🚀 Future Enhancements

### Planned Languages
- 🇪🇸 Spanish (Español)
- 🇵🇹 Portuguese (Português)
- 🇳🇱 Dutch (Nederlands)
- 🇷🇺 Russian (Русский)
- 🇯🇵 Japanese (日本語)

### Advanced Features
- 📊 Weekly and monthly reports
- 🌤️ Weather API integration
- 📈 Export to CSV/Excel
- 🎯 Custom efficiency targets
- 🔊 Voice announcements via HomePod

---

**Ready to get started?** Enable daily reports in your configuration and start receiving personalized solar summaries in your preferred language! 🌞📊
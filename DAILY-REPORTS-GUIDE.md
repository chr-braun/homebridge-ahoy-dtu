# 📊 Daily Solar Reports with Multi-Language Support

## Overview

The Daily Solar Reports feature provides end-of-day summaries of your solar production delivered as HomeKit notifications in your preferred language. Get insights into your daily energy generation, peak performance, and comparisons with previous days - all automatically delivered when the sun goes down.

## 🌍 Supported Languages

- 🇺🇸 **English** (`en`) - Default
- 🇩🇪 **Deutsch** (`de`) - German
- 🇫🇷 **Français** (`fr`) - French
- 🇮🇹 **Italiano** (`it`) - Italian
- 🇨🇳 **中文** (`zh`) - Chinese (Simplified)

## 🚀 Quick Setup

### 1. Enable Daily Reports
```json
{
  "dailyReports": {
    "enabled": true,
    "language": "de",
    "reportStyle": "motion",
    "reportTime": "sunset+30"
  }
}
```

### 2. Configure Language
Choose your preferred language from the dropdown in Homebridge UI or set manually:
- `"language": "en"` - English
- `"language": "de"` - German  
- `"language": "fr"` - French
- `"language": "it"` - Italian
- `"language": "zh"` - Chinese

### 3. Select Delivery Method
Choose how to receive reports:
- **Motion Sensor** (recommended) - Triggers HomeKit notification
- **Doorbell** - Ring notification with summary
- **Programmable Switch** - Press event with data

## 📱 Example Reports

### English Report
```
Solar production complete for today
• Generated: 18.4 kWh (92% of target)
• Peak: 3.2 kW at 1:15 PM
• +12% vs yesterday
```

### German Report
```
Solarproduktion für heute abgeschlossen
• Erzeugt: 18.4 kWh (92% des Ziels)
• Spitze: 3.2 kW um 13:15
• +12% im Vergleich zu gestern
```

### French Report
```
Production solaire terminée pour aujourd'hui
• Générée: 18.4 kWh (92% de l'objectif)
• Pic: 3.2 kW à 13:15
• +12% par rapport à hier
```

### Italian Report
```
Produzione solare completata per oggi
• Generata: 18.4 kWh (92% dell'obiettivo)
• Picco: 3.2 kW alle 13:15
• +12% rispetto a ieri
```

### Chinese Report
```
今日太阳能发电完成
• 发电量：18.4 千瓦时（目标的92%）
• 峰值：3.2 千瓦 于 13:15
• 比昨日+12%
```

## ⚙️ Configuration Options

### Basic Configuration
```json
{
  "dailyReports": {
    "enabled": true,
    "language": "en",
    "reportStyle": "motion",
    "reportTime": "sunset+30",
    "includeComparisons": true
  }
}
```

### Advanced Configuration
```json
{
  "dailyReports": {
    "enabled": true,
    "language": "fr",
    "reportStyle": "motion",
    "reportTime": "20:30",
    "includeComparisons": true,
    "customMessages": true
  }
}
```

### Configuration Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable/disable daily reports |
| `language` | string | `"en"` | Report language (en, de, fr, it, zh) |
| `reportStyle` | string | `"motion"` | Delivery method (motion, doorbell, switch) |
| `reportTime` | string | `"sunset+30"` | When to send reports |
| `includeComparisons` | boolean | `true` | Include yesterday/weekly comparisons |

### Report Timing Options

| Value | Description | Example Time |
|-------|-------------|--------------|
| `"sunset"` | At astronomical sunset | 19:00 |
| `"sunset+30"` | 30 minutes after sunset | 19:30 |
| `"sunset+60"` | 1 hour after sunset | 20:00 |
| `"20:00"` | Fixed time (24h format) | 8:00 PM |
| `"21:30"` | Custom fixed time | 9:30 PM |

## 📊 Report Content

### Metrics Included
- **Daily Energy**: Total kWh generated today
- **Peak Power**: Maximum power output and time
- **Production Hours**: Hours of active generation
- **Efficiency**: Percentage of target achieved
- **Weather Analysis**: Estimated conditions from power curve

### Smart Comparisons
- **Yesterday**: +15% vs yesterday
- **Weekly Average**: Above/below weekly average
- **Records**: New daily record notifications

### Weather Detection
The system analyzes your power production curve to estimate weather conditions:
- ☀️ **Sunny**: High, stable production
- 🌤️ **Partly Cloudy**: Good production with some variation
- ⛅ **Cloudy**: Lower production levels
- 🌧️ **Mixed**: Highly variable production

## 🏠 HomeKit Integration

### Motion Sensor Delivery
Creates a Motion Sensor accessory named "Daily Solar Report":
- Triggers motion detection at report time
- Sends rich HomeKit notification with summary
- Automatically resets after 5 seconds
- Perfect for HomeKit automations

### Automation Examples
```
When "Daily Solar Report" detects motion:
→ Turn on pool pump (if good production day)
→ Send notification to family members
→ Log data to spreadsheet app
→ Adjust home heating/cooling
```

### Notification Settings
Configure in Home app:
1. Go to Motion Sensor settings
2. Enable notifications
3. Choose notification style (banner, alert)
4. Set delivery times

## 🔧 Technical Details

### Data Storage
- Tracks hourly production data
- Maintains 30-day history
- Calculates rolling averages
- Detects production patterns

### Smart Timing
- Automatic sunset calculation
- Detects end of production
- Configurable delay triggers
- Time zone aware

### Language Processing
- Full localization of all text
- Locale-specific number formatting
- Cultural adaptations
- Extensible language system

## 🐛 Troubleshooting

### No Reports Received
1. Check `enabled: true` in configuration
2. Verify Motion Sensor accessory exists in Home app
3. Ensure notifications enabled for accessory
4. Check Homebridge logs for errors

### Wrong Language
1. Verify language code is correct (en, de, fr, it, zh)
2. Check Homebridge logs for language loading messages
3. Restart Homebridge after language changes

### Timing Issues
1. Check system time zone settings
2. Verify report time configuration
3. Monitor logs for report trigger messages
4. Test with manual trigger if available

### Missing Data
1. Ensure power data is being received
2. Check MQTT connectivity
3. Verify energy tracking is working
4. Review data validation logs

## 🚀 Future Enhancements

### Planned Features
- Weekly and monthly reports
- Export to CSV/Excel
- Integration with weather APIs
- Custom report templates
- Push notification support
- Voice announcements via HomePod

### Additional Languages
We plan to add support for:
- Spanish (Español)
- Portuguese (Português)
- Dutch (Nederlands)
- Russian (Русский)
- Japanese (日本語)

## 📝 Example Automation Scripts

### iOS Shortcuts Integration
Create a Shortcut that runs when motion is detected:
1. Get daily report data
2. Send to family chat
3. Update tracking spreadsheet
4. Post to social media (optional)

### HomeKit Scenes
"Good Solar Day" scene (triggered by high production reports):
- Turn on pool equipment
- Charge electric vehicles
- Run energy-intensive appliances
- Adjust smart thermostat

## 💡 Tips & Best Practices

### Optimal Settings
- Use `"sunset+30"` for most accurate timing
- Enable comparisons for better insights
- Choose Motion Sensor for richest notifications
- Set language to match your HomeKit setup

### Energy Optimization
Use daily reports to:
- Track seasonal performance changes
- Identify optimal production hours
- Plan energy-intensive activities
- Monitor system health trends

### Family Sharing
- Share Motion Sensor with family members
- Create group notifications
- Set up automation for multiple devices
- Use in HomeKit scenes and shortcuts

---

**Ready to get started?** Enable daily reports in your configuration and start receiving personalized solar summaries in your preferred language! 🌞📊
# 🌞 Homebridge AHOY-DTU Plugin (work in progress)

> ⚠️ **Work in Progress** - This plugin is currently under active development. While functional, some features may change before the first stable release.

<div align="center">

[![npm version](https://badge.fury.io/js/homebridge-ahoy-dtu.svg)](https://badge.fury.io/js/homebridge-ahoy-dtu)
[![npm downloads](https://img.shields.io/npm/dm/homebridge-ahoy-dtu.svg)](https://www.npmjs.com/package/homebridge-ahoy-dtu)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![GitHub stars](https://img.shields.io/github/stars/chr-braun/homebridge-ahoy-dtu?style=social)](https://github.com/chr-braun/homebridge-ahoy-dtu/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/chr-braun/homebridge-ahoy-dtu)](https://github.com/chr-braun/homebridge-ahoy-dtu/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/chr-braun/homebridge-ahoy-dtu)](https://github.com/chr-braun/homebridge-ahoy-dtu/commits/main)

**Monitor your AHOY-DTU solar inverter data in Apple HomeKit via MQTT**

[Installation](#-installation) • [Configuration](#-quick-setup) • [Features](#-key-features) • [Documentation](#-documentation) • [Support](#-support)

![Homebridge AHOY-DTU Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=AHOY-DTU+Solar+Monitoring+in+HomeKit)

</div>

## 🌟 Key Features

- **🌍 Multi-Language Daily Reports** - Get personalized end-of-day solar summaries in 5 languages (🇺🇸🇩🇪🇫🇷🇮🇹🇨🇳) via HomeKit notifications
- **🎨 Modern Homebridge UI** - Beautiful, responsive GUI with step-by-step setup
- **🔍 Easy Device Discovery** - Just enter your MQTT server IP and discover all available devices
- **🚀 Quick Setup Presets** - Choose from Basic, Detailed, or Custom configurations
- **⚡ Flexible Power Display** - Choose between Light Sensor (exact watts) or Outlet (on/off state) representation
- **🌙 Offline Detection** - Automatically detects when solar system shuts down (evening/night/no sun)
- **📐 Flexible Device Selection** - Choose exactly which MQTT topics to expose as HomeKit devices  
- **✅ Smart Data Validation** - Automatic filtering of invalid/error messages
- **📊 Health Monitoring** - Track device connectivity and data freshness
- **⚡ Smart Energy Calculation** - Configurable daily energy limits for accurate percentages
- **🔄 Real-time Updates** - Live monitoring of solar power, energy, temperature, and status

## 🌍 NEW: Multi-Language Daily Reports

> **🎆 Latest Feature!** Get intelligent end-of-day solar production summaries delivered right to your HomeKit devices in your preferred language.

### 🗣️ Supported Languages
| Language | Code | Sample Report |
|----------|------|---------------|
| **🇺🇸 English** | `en` | "Solar production complete • Generated: 15.8 kWh (79% of target) • Peak: 4.2 kW at 13:15 • +12% vs yesterday" |
| **🇩🇪 German** | `de` | "Solarproduktion abgeschlossen • Erzeugt: 15,8 kWh (79% des Ziels) • Spitze: 4,2 kW um 13:15 • +12% vs gestern" |
| **🇫🇷 French** | `fr` | "Production solaire terminée • Générée: 15,8 kWh (79% de l'objectif) • Pic: 4,2 kW à 13:15 • +12% vs hier" |
| **🇮🇹 Italian** | `it` | "Produzione solare completata • Generata: 15,8 kWh (79% dell'obiettivo) • Picco: 4,2 kW alle 13:15 • +12% vs ieri" |
| **🇨🇳 Chinese** | `zh` | "今日太阳能发电完成 • 发电量：15.8 千瓦时（目标的79%） • 峰值：4.2 千瓦 于 13:15 • 昨日+12%" |

### 📱 Quick Setup for Daily Reports
```json
{
  "platforms": [{
    "platform": "AhoyDTU",
    "mqttHost": "192.168.1.100",
    "usePreset": "detailed",
    "dailyReports": {
      "enabled": true,
      "language": "de",
      "reportStyle": "motion",
      "reportTime": "sunset+30"
    }
  }]
}
```

📚 **[Read the complete Multi-Language Daily Reports Guide](./MULTILANG-DAILY-REPORTS.md)**

## 📦 Installation

### Via Homebridge Config UI X (Recommended)

1. **Search** for `homebridge-ahoy-dtu` in the Plugins tab
2. **Install** with one click
3. **Configure** using the beautiful GUI interface
4. **Restart** Homebridge

### Via Command Line

```bash
# Install stable release (recommended)
npm install -g homebridge-ahoy-dtu

# Install development version (latest features)
npm install -g homebridge-ahoy-dtu@dev

# Install beta version (testing)
npm install -g homebridge-ahoy-dtu@beta

# Install release candidate
npm install -g homebridge-ahoy-dtu@rc

# Add to your Homebridge config.json (see configuration below)
```

**⚠️ Warning:** Development, Beta, and RC versions may contain unstable features and bugs. Use only for testing purposes.

### Requirements

- **Node.js** >=14.18.1
- **Homebridge** >=1.3.0
- **AHOY-DTU** device with MQTT enabled
- **MQTT Broker** (e.g., Mosquitto)

## 🚀 Quick Setup

### Option 1: Use a Preset (Fastest)

**Basic Monitoring** (Power + Daily Energy + Status):
```json
{
  "platforms": [
    {
      "platform": "AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqttHost": "192.168.1.100",
      "usePreset": "basic",
      "maxEnergyPerDay": 10
    }
  ]
}
```

**Detailed Monitoring** (Adds Temperature + Efficiency + Total Energy):
```json
{
  "platforms": [
    {
      "platform": "AhoyDTU",
      "name": "AHOY-DTU Solar", 
      "mqttHost": "192.168.1.100",
      "usePreset": "detailed",
      "maxEnergyPerDay": 15
    }
  ]
}
```

### Option 2: Discover Your Devices (Custom Setup)

**Step 1 - Discovery:**
```json
{
  "platforms": [
    {
      "platform": "AhoyDTU", 
      "name": "AHOY-DTU Solar",
      "mqttHost": "192.168.1.100",
      "mqttPort": 1883,
      "mqttUsername": "your-username",
      "mqttPassword": "your-password", 
      "discoverDevices": true
    }
  ]
}
```

**Step 2 - See Available Topics in Logs:**
```
Device discovery completed. Found 6 devices:
- AHOY-DTU_TOTAL/power (power): 1250.5
- AHOY-DTU_TOTAL/energy_today (energy): 8500
- AHOY-DTU_TOTAL/temperature (temperature): 45.2
- AHOY-DTU_114172220001/power (power): 625.2
- AHOY-DTU_114172220001/voltage (voltage): 42.1
- ... and more
```

**Step 3 - Select Desired Topics:**
```json
{
  "platforms": [
    {
      "platform": "AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqttHost": "192.168.1.100",
      "discoverDevices": false,
      "selectedDevices": [
        "AHOY-DTU_TOTAL/power",
        "AHOY-DTU_TOTAL/energy_today",
        "AHOY-DTU_TOTAL/temperature",
        "AHOY-DTU_TOTAL/status"
      ]
    }
  ]
}
```

## 📱 HomeKit Device Types

### ⚡ Power Measurement Options

The plugin offers **two ways** to display power data in HomeKit:

| Method | Service Type | What You See | Best For |
|--------|--------------|--------------|----------|
| **Light Sensor** (default) | Light Sensor | Exact watts as "Lux" values | Precise monitoring, automations |
| **Outlet Switch** (new) | Outlet | On/Off power state + logs | Simple monitoring, visual status |

**Configure power method:**
```json
{
  "usePowerOutlets": true   // Enable outlet display for power
}
```

📖 **[Read detailed comparison](./POWER-MEASUREMENT-OPTIONS.md)** for choosing the best option.

### All Device Mappings

| MQTT Data Type | HomeKit Device | What You'll See |
|----------------|----------------|------------------|
| **Power** | Light Sensor / Outlet | Current power output (W as Lux) or On/Off state ⚡ |
| **Energy** | Humidity Sensor | Energy production as percentage |
| **Temperature** | Temperature Sensor | Temperature in °C |
| **Status** | Contact Sensor | Online/offline status |
| **Other Numbers** | Light Sensor | Generic numeric values |

## ⚙️ Configuration Options

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `mqttHost` | ✅ | - | Your MQTT server IP address |
| `mqttPort` | ❌ | 1883 | MQTT server port |
| `mqttUsername` | ❌ | - | MQTT username (if needed) |
| `mqttPassword` | ❌ | - | MQTT password (if needed) |
| `discoverDevices` | ❌ | false | Set to `true` to discover, `false` to use selected devices |
| `usePreset` | ❌ | - | Quick setup: `"basic"`, `"detailed"`, or `"individual-inverters"` |
| `selectedDevices` | ❌ | [] | Array of MQTT topics to create HomeKit devices for |
| `maxEnergyPerDay` | ❌ | 10 | Maximum daily energy (kWh) for percentage calculation |
| `offlineThresholdMinutes` | ❌ | 15 | Minutes without data before marking device offline |
| `usePowerOutlets` | ❌ | false | Use Outlet service for power (shows on/off state vs exact watts) |
| `dailyReports.enabled` | ❌ | false | Enable multi-language daily solar reports |
| `dailyReports.language` | ❌ | "en" | Report language: "en", "de", "fr", "it", "zh" |
| `dailyReports.reportStyle` | ❌ | "motion" | Delivery method: "motion", "doorbell", "switch" |
| `dailyReports.reportTime` | ❌ | "sunset+30" | When to send: "sunset", "sunset+30", "HH:MM" |

## 🌃 Offline Detection (Night/No Sun)

The plugin automatically detects when your AHOY-DTU device goes offline, which is normal behavior during:
- **Evening/Night hours** when solar panels produce no power
- **Cloudy days** with insufficient sunlight
- **System maintenance** or temporary disconnections

### How it Works:
1. **Monitors MQTT Activity**: Tracks when last data was received
2. **Configurable Threshold**: Default 15 minutes without data = offline
3. **Smart Status Updates**: 
   - **Power sensors** show 0W (no generation)
   - **Status sensors** show "not producing"
   - **Energy sensors** maintain last reading (preserves daily totals)
   - **Temperature** keeps last known value

### Configuration:
```json
{
  "platform": "AhoyDTU",
  "mqttHost": "192.168.1.100",
  "offlineThresholdMinutes": 15,
  "usePreset": "basic"
}
```

### Log Messages:
- `⚠️ AHOY-DTU device appears to be offline - no data received for 16 minutes`
- `ℹ️ This is normal during evening/night or when there is no sunlight`
- `✅ AHOY-DTU device is back online - solar production may have resumed`

## 📱 Modern Homebridge UI

The plugin includes a beautiful, user-friendly GUI for Homebridge Config UI X:

### 🎨 Visual Features:
- **Professional design** with gradients and modern styling
- **Responsive layout** that works on desktop, tablet, and mobile
- **Step-by-step guidance** with helpful instructions
- **Color-coded sections** for easy navigation
- **Emoji icons** for visual clarity

### 🛠️ Setup Sections:
1. **📝 Basic Configuration** - Essential platform settings
2. **🔌 MQTT Connection** - Server details with optional authentication
3. **🔧 Device Setup** - Discovery, presets, or custom topic selection
4. **⚙️ Advanced Settings** - Fine-tuning for power users
5. **📜 Legacy Support** - Backward compatibility

### 🤝 User-Friendly Features:
- **Conditional fields** - Only show relevant options
- **Input validation** - Real-time checking of IP addresses, ports, etc.
- **Help integration** - Context-sensitive guidance and examples
- **Quick start guide** - Built-in setup instructions
- **Topic reference** - Common AHOY-DTU MQTT topics listed

### 📱 Mobile Optimized:
- **Touch-friendly** controls with proper sizing
- **Collapsible sections** to save screen space
- **Readable fonts** and high contrast
- **Responsive design** adapts to any screen size

## 📋 AHOY-DTU MQTT Topics

AHOY-DTU publishes solar inverter data to specific MQTT topics. Here are the most common ones:

**Total/Summary Topics:**
```
AHOY-DTU_TOTAL/power          # Current total power output (W)
AHOY-DTU_TOTAL/energy_today   # Daily energy production (Wh)
AHOY-DTU_TOTAL/energy_total   # Total lifetime energy (kWh)
AHOY-DTU_TOTAL/temperature    # Inverter temperature (°C)
AHOY-DTU_TOTAL/status         # System status (online/offline)
AHOY-DTU_TOTAL/efficiency     # System efficiency (%)
```

**Individual Inverter Topics (where 123456 is your inverter serial):**
```
AHOY-DTU_123456/power         # Individual inverter power (W)
AHOY-DTU_123456/voltage       # DC voltage (V)
AHOY-DTU_123456/current       # DC current (A)
AHOY-DTU_123456/frequency     # AC frequency (Hz)
AHOY-DTU_123456/temperature   # Individual inverter temperature (°C)
AHOY-DTU_123456/rssi          # Signal strength (dBm)
```

**Device Naming Examples:**
- `AHOY-DTU_TOTAL/power` → "Solar Power"
- `AHOY-DTU_TOTAL/energy_today` → "Solar Daily Energy"
- `AHOY-DTU_123456/power` → "123456 Power"
- `AHOY-DTU_123456/temperature` → "123456 Temperature"

## 🔄 How It Works

**Discovery Mode** (`discoverDevices: true`):
- Listens to ALL MQTT topics for 30 seconds
- Shows you what's available in the logs
- No HomeKit devices created yet

**Production Mode** (`discoverDevices: false`):  
- Only subscribes to your `selectedDevices`
- Creates HomeKit accessories for each topic
- Real-time updates from MQTT to HomeKit

## 🛠️ Troubleshooting

**No devices found during discovery?**
- Check your MQTT server IP address and credentials
- Make sure your AHOY-DTU is publishing to MQTT
- Verify network connection between Homebridge and MQTT server

**HomeKit devices not updating?**
- Check that your selected topics are actively publishing data
- Verify MQTT credentials in your config
- Look for MQTT connection errors in Homebridge logs

**Device names look weird?**
- Names are auto-generated from MQTT topics
- Example: `AHOY-DTU_TOTAL/power` → "AHOY-DTU_TOTAL Power"
- You can rename them in the Home app after creation

## 📚 Documentation

- **[Installation Guide](./INSTALL.md)** - Detailed setup instructions
- **[Configuration Examples](./config-examples.json)** - Various setup scenarios
- **[MQTT Specifications](./AHOY-DTU-MQTT-SPECS.md)** - Complete topic reference
- **[GUI Documentation](./HOMEBRIDGE-UI-GUIDE.md)** - Interface guide
- **[Changelog](./CHANGELOG.md)** - Version history

## 🆘 Support

Having issues? Check the [GitHub repository](https://github.com/chr-braun/homebridge-ahoy-dtu) for help and to report bugs.

- **🐛 Report Issues**: [GitHub Issues](https://github.com/chr-braun/homebridge-ahoy-dtu/issues)
- **📚 Documentation**: [Installation Guide](./INSTALL.md)
- **💬 Community**: [Homebridge Discord](https://discord.gg/kqNCe2D)
- **🔧 Debugging**: Check [Troubleshooting Guide](./README.md#troubleshooting)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - Use freely! See [LICENSE](./LICENSE) for details.

---

<div align="center">
Made with ❤️ for the Homebridge and solar energy communities
</div>

# homebridge-ahoy-dtu

**Monitor your AHOY-DTU solar inverter data in Apple HomeKit via MQTT**

[![npm version](https://badge.fury.io/js/homebridge-ahoy-dtu.svg)](https://www.npmjs.com/package/homebridge-ahoy-dtu)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

## Features

- 🌞 **Real-time solar monitoring** in Apple HomeKit
- 🔍 **Automatic device discovery** via MQTT
- ⚡ **Configurable power display** - Light Sensor (exact watts) or Outlet (on/off state)
- 🚀 **Quick setup presets** - Basic, Detailed, or Custom
- 🌙 **Smart offline detection** for night/no-sun periods
- 📱 **Modern Homebridge UI** with step-by-step configuration

## Quick Start

### 1. Install

```bash
npm install -g homebridge-ahoy-dtu
```

### 2. Configure

**Automatic Setup (Recommended):**
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "usePreset": "basic"
}
```

**Discovery Mode:**
```json
{
  "platform": "AhoyDTU", 
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "discoverDevices": true
}
```

### 3. Restart Homebridge

Your solar data will appear in the Home app as:
- **Solar Power** - Current power output
- **Daily Energy** - Energy production percentage  
- **Temperature** - Inverter temperature
- **Status** - Online/offline state

## Power Display Options

Choose how power is displayed in HomeKit:

| Mode | Display | Best For |
|------|---------|----------|
| **Light Sensor** (default) | Exact watts as "lux" | Precise monitoring |
| **Outlet Service** | On/off state + logged watts | Simple indication |

Enable outlet mode: `"usePowerOutlets": true`

## Configuration Options

| Option | Required | Description |
|--------|----------|-------------|
| `mqttHost` | ✅ | MQTT server IP address |
| `mqttPort` | ❌ | MQTT port (default: 1883) |
| `mqttUsername` | ❌ | MQTT username (if required) |
| `mqttPassword` | ❌ | MQTT password (if required) |
| `usePreset` | ❌ | Quick setup: "basic", "detailed" |
| `selectedDevices` | ❌ | Custom MQTT topics array |
| `usePowerOutlets` | ❌ | Use outlet service for power |
| `maxEnergyPerDay` | ❌ | Max daily energy (kWh) for % calc |
| `offlineThresholdMinutes` | ❌ | Offline detection threshold |

## MQTT Topics

Standard AHOY-DTU topics:
- `AHOY-DTU_TOTAL/power` - Current power (W)
- `AHOY-DTU_TOTAL/energy_today` - Daily energy (Wh)
- `AHOY-DTU_TOTAL/temperature` - Temperature (°C)
- `AHOY-DTU_TOTAL/status` - System status

## Requirements

- **Node.js** ≥14.18.1
- **Homebridge** ≥1.3.0
- **AHOY-DTU** with MQTT enabled
- **MQTT Broker** (Mosquitto, etc.)

## Support

- **Documentation:** [GitHub Repository](https://github.com/chr-braun/homebridge-ahoy-dtu)
- **Issues:** [Report Bugs](https://github.com/chr-braun/homebridge-ahoy-dtu/issues)
- **License:** MIT

---

**Made with ❤️ for the solar community**
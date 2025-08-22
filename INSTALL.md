# AHOY-DTU Homebridge Plugin - Installation Guide

## 🚀 Quick Installation

### Method 1: Via Homebridge Config UI X (Recommended)

1. **Open Homebridge Config UI X** in your web browser
2. **Go to Plugins** tab
3. **Search for** `homebridge-ahoy-dtu`
4. **Click Install** and wait for completion
5. **Configure** using the beautiful GUI interface
6. **Restart Homebridge** when prompted

### Method 2: Via Command Line

```bash
# Install globally
npm install -g homebridge-ahoy-dtu

# Or install locally in your Homebridge directory
cd ~/.homebridge
npm install homebridge-ahoy-dtu
```

## ⚙️ Configuration

### Using the GUI (Easiest)

1. **Add Platform** in Homebridge Config UI X
2. **Select "AHOY-DTU"** from the dropdown
3. **Follow the step-by-step interface:**
   - Enter your MQTT server IP
   - Choose setup method (Discovery/Preset/Custom)
   - Configure advanced settings if needed
4. **Save and restart** Homebridge

### Manual Configuration

Add this to your Homebridge `config.json`:

```json
{
  "platforms": [
    {
      "platform": "AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqttHost": "192.168.1.100",
      "usePreset": "basic"
    }
  ]
}
```

## 🔧 Setup Methods

### 1. Quick Presets (Recommended for beginners)
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "usePreset": "detailed",
  "maxEnergyPerDay": 15
}
```

### 2. Device Discovery (For exploration)
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar", 
  "mqttHost": "192.168.1.100",
  "discoverDevices": true
}
```

### 3. Custom Topics (For advanced users)
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "selectedDevices": [
    "AHOY-DTU_TOTAL/power",
    "AHOY-DTU_TOTAL/energy_today",
    "AHOY-DTU_TOTAL/temperature"
  ]
}
```

## 📋 Prerequisites

### Required
- **AHOY-DTU device** properly configured and running
- **MQTT broker** (like Mosquitto) accessible on your network
- **Homebridge** installed and running
- **Node.js** >=14.18.1

### Network Setup
- AHOY-DTU publishing to MQTT broker
- Homebridge server can access MQTT broker
- All devices on same network or properly routed

## 🔍 Verification

### Check MQTT Data
```bash
# Install mosquitto client tools
sudo apt-get install mosquitto-clients  # Linux
brew install mosquitto                   # macOS

# Test MQTT connection
mosquitto_sub -h YOUR_MQTT_IP -t "AHOY-DTU_TOTAL/#" -v
```

### Check Homebridge Logs
```bash
# View Homebridge logs
tail -f ~/.homebridge/homebridge.log

# Look for AHOY-DTU messages
grep "AHOY-DTU" ~/.homebridge/homebridge.log
```

## 🛠 Troubleshooting

### Common Issues

**No devices appear in HomeKit:**
- Check MQTT connection and credentials
- Verify AHOY-DTU is publishing data
- Ensure topics are correctly configured

**Devices show as "No Response":**
- Check offline threshold settings
- Verify MQTT broker is running
- Confirm network connectivity

**Data not updating:**
- Check MQTT topic names match exactly
- Verify AHOY-DTU is sending valid data
- Review Homebridge logs for errors

### Debug Mode
Enable debug logging in Homebridge:
```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "CC:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-154"
  },
  "accessories": [],
  "platforms": [
    {
      "platform": "AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqttHost": "192.168.1.100",
      "_bridge": {
        "debug": true
      }
    }
  ]
}
```

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and examples
- **Community**: Homebridge Discord/Reddit communities
- **MQTT Tools**: Use MQTT Explorer for debugging

## 🔄 Updating

### Via Config UI X
1. Go to Plugins tab
2. Click Update next to homebridge-ahoy-dtu
3. Restart Homebridge

### Via Command Line
```bash
npm update -g homebridge-ahoy-dtu
```

## 🎯 Next Steps

1. **Install the plugin** using your preferred method
2. **Configure MQTT connection** with your broker details
3. **Choose setup method** that matches your experience level
4. **Test the connection** and verify data in HomeKit
5. **Customize settings** for your specific solar setup
6. **Enjoy monitoring** your solar production in HomeKit!

---

**Need help?** Check the main README.md for detailed configuration options and troubleshooting guides.
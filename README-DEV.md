# 🏠 Homebridge Kostal Inverter Plugin - Development Branch

> 🚧 **Development Version** - This is the development branch with the latest features and experimental functionality. Use at your own risk!

<div align="center">

[![npm version](https://badge.fury.io/js/homebridge-kostal-inverter.svg)](https://badge.fury.io/js/homebridge-kostal-inverter)
[![npm downloads](https://img.shields.io/npm/dm/homebridge-kostal-inverter.svg)](https://www.npmjs.com/package/homebridge-kostal-inverter)
[![GitHub branch](https://img.shields.io/github/checks-status/yourusername/homebridge-kostal-inverter/dev)](https://github.com/yourusername/homebridge-kostal-inverter/tree/dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Latest development features for Kostal solar inverter monitoring**

[Installation](#-installation) • [New Features](#-new-features) • [Breaking Changes](#-breaking-changes) • [Testing](#-testing)

</div>

## 🚀 Development Features

This development branch includes experimental features that may not be stable:

### 🌍 Multi-Language Support (Experimental)
- **5 Language Support**: Deutsch, English, Français, Italiano, 中文
- **Localized UI**: Interface elements in your preferred language
- **Smart Error Messages**: Context-aware error descriptions
- **Configuration Help**: Language-specific setup guidance

### 🎨 Enhanced Homebridge UI
- **Modern Design**: Beautiful, responsive interface
- **Step-by-Step Setup**: Guided configuration process
- **Real-time Validation**: Input checking and error prevention
- **Mobile Optimized**: Touch-friendly controls

### 🔌 Advanced Child Bridge
- **Separate Process**: Runs independently from main Homebridge
- **Configurable Ports**: Custom port assignment
- **Better Stability**: Isolated from other plugins
- **Performance Monitoring**: Resource usage tracking

### ⚡ Enhanced MQTT Integration
- **Topic Customization**: Flexible MQTT topic configuration
- **Reconnection Logic**: Automatic recovery from connection issues
- **Message Validation**: Smart filtering of invalid data
- **Performance Optimization**: Efficient message processing

## 📦 Installation

### Development Version (Recommended for Testing)

```bash
# Install development version
npm install -g homebridge-kostal-inverter@dev

# Or install from GitHub
npm install -g yourusername/homebridge-kostal-inverter#dev
```

### Requirements

- **Node.js** >=18.0.0
- **Homebridge** >=1.6.0
- **Kostal inverter** with MQTT interface
- **MQTT broker** (e.g., Mosquitto)

## 🔧 Configuration

### Quick Setup

```json
{
  "platform": "KostalInverter",
  "name": "Kostal Solar Dev",
  "mqtt": {
    "host": "192.168.1.100",
    "port": 1883,
    "username": "your_username",
    "password": "your_password",
    "clientId": "homebridge-kostal-dev"
  },
  "inverter": {
    "name": "Kostal Piko",
    "model": "Piko 10.0",
    "serialNumber": "123456789",
    "maxPower": 10000,
    "maxEnergyPerDay": 20,
    "strings": 2
  },
  "language": "de",
  "childBridge": true,
  "childBridgePort": 8581,
  "updateInterval": 30,
  "debug": true
}
```

### Advanced Configuration with Custom Topics

```json
{
  "platform": "KostalInverter",
  "name": "Kostal Solar Dev",
  "mqtt": {
    "host": "192.168.1.100",
    "port": 1883,
    "username": "your_username",
    "password": "your_password",
    "clientId": "homebridge-kostal-dev",
    "topics": {
      "power": "kostal/inverter/power",
      "energy": "kostal/inverter/energy_today",
      "status": "kostal/inverter/status",
      "temperature": "kostal/inverter/temperature",
      "voltage": "kostal/inverter/voltage_ac",
      "frequency": "kostal/inverter/frequency",
      "power_dc1": "kostal/inverter/power_dc1",
      "power_dc2": "kostal/inverter/power_dc2",
      "voltage_dc1": "kostal/inverter/voltage_dc1",
      "voltage_dc2": "kostal/inverter/voltage_dc2"
    }
  },
  "inverter": {
    "name": "Kostal Piko",
    "model": "Piko 10.0",
    "serialNumber": "123456789",
    "maxPower": 10000,
    "maxEnergyPerDay": 20,
    "strings": 2
  },
  "language": "de",
  "childBridge": true,
  "childBridgePort": 8581,
  "updateInterval": 15,
  "debug": true
}
```

## 🆕 New Features in Dev Branch

### 1. Enhanced Multi-Language Support
- **5 languages** with full localization
- **Context-sensitive help** in your language
- **Smart error messages** with translations
- **Configuration guidance** in native language

### 2. Advanced Child Bridge
- **Separate process** for better stability
- **Custom port configuration** (8000-9000 range)
- **Performance isolation** from main Homebridge
- **Independent restart** capabilities

### 3. Flexible MQTT Configuration
- **Custom topic mapping** for different inverter models
- **Topic validation** and error checking
- **Automatic reconnection** with exponential backoff
- **Message filtering** and validation

### 4. Enhanced HomeKit Integration
- **Multiple service types** based on device type
- **Smart value mapping** for different data types
- **Performance optimization** for large installations
- **Health monitoring** and status tracking

## ⚠️ Breaking Changes

### From Stable Version
- **Configuration structure** has been updated
- **New MQTT configuration** format required
- **Enhanced inverter settings** with new options
- **Updated service types** for better HomeKit integration

### Migration Guide
1. **Backup** your current configuration
2. **Update** to the new configuration format
3. **Test** with a small subset of devices first
4. **Monitor** logs for any issues

## 🧪 Testing

### Development Testing
```bash
# Clone the repository
git clone https://github.com/yourusername/homebridge-kostal-inverter.git
cd homebridge-kostal-inverter

# Switch to dev branch
git checkout dev

# Install dependencies
npm install

# Build the plugin
npm run build

# Link for development
npm link
```

### Test Configuration
```json
{
  "platform": "KostalInverter",
  "name": "Test Kostal",
  "mqtt": {
    "host": "192.168.1.100",
    "port": 1883,
    "clientId": "homebridge-kostal-test"
  },
  "inverter": {
    "name": "Test Inverter",
    "model": "Test Model",
    "serialNumber": "TEST-001",
    "maxPower": 5000,
    "maxEnergyPerDay": 10,
    "strings": 1
  },
  "language": "en",
  "childBridge": true,
  "debug": true
}
```

## 🐛 Known Issues

### Development Branch
- **MQTT reconnection** logic is being optimized
- **Performance monitoring** is experimental
- **UI elements** may appear differently in various browsers
- **Language switching** requires restart

### Workarounds
- **Restart Homebridge** if MQTT issues occur
- **Clear browser cache** for UI issues
- **Check MQTT logs** for connection problems
- **Disable advanced features** if stability issues occur

## 🔄 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch from `dev`
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request to `dev` branch

### Testing Guidelines
- **Test** on multiple Homebridge versions
- **Verify** MQTT connectivity
- **Check** HomeKit integration
- **Validate** configuration options
- **Test** multi-language support

## 📊 Performance

### Development Optimizations
- **Reduced memory usage** with better caching
- **Faster MQTT processing** with optimized parsing
- **Improved error handling** with graceful fallbacks
- **Better logging** with structured output

### Benchmarks
- **MQTT message processing**: <5ms per message
- **HomeKit updates**: <10ms per characteristic
- **Memory usage**: ~20MB typical
- **CPU usage**: <1% during normal operation

## 🚀 Roadmap

### Short Term (Next 2-4 weeks)
- [ ] **Stabilize MQTT handling** for large installations
- [ ] **Optimize language switching** without restart
- [ ] **Improve error messages** and user guidance
- [ ] **Add more inverter models** support

### Medium Term (1-3 months)
- [ ] **Advanced analytics** dashboard
- [ ] **Weather integration** for production predictions
- [ ] **Multi-inverter support** for complex installations
- [ ] **API endpoints** for external integrations

### Long Term (3-6 months)
- [ ] **Machine learning** for production optimization
- [ ] **Cloud synchronization** for multi-home setups
- [ ] **Advanced automation** triggers
- [ ] **Professional monitoring** features

## 🆘 Support

### Development Support
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/homebridge-kostal-inverter/issues)
- **Discussions**: [Feature requests](https://github.com/yourusername/homebridge-kostal-inverter/discussions)
- **Discord**: [Homebridge Community](https://discord.gg/kqNCe2D)

### Debug Information
```bash
# Enable debug mode
"debug": true

# Check logs
tail -f ~/.homebridge/homebridge.log | grep "Kostal"

# Child Bridge logs
tail -f ~/.homebridge/homebridge-kostal.log
```

## 📝 Changelog

### Latest Dev Changes
- **v1.0.0-dev.1**: Initial development release with multi-language support
- **v1.0.0-dev.0**: Basic MQTT integration and HomeKit services
- **v0.9.0-dev.3**: Enhanced error handling and validation
- **v0.9.0-dev.2**: Initial Kostal inverter support

### Full Changelog
See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

<div align="center">
**Development branch - Use at your own risk! 🚧**

Made with ❤️ for the Homebridge and solar energy communities
</div>

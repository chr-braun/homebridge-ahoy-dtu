# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of homebridge-ahoy-dtu plugin
- Real-time solar power monitoring via MQTT
- Support for AHOY-DTU solar inverter devices
- Modern Homebridge Config UI X interface with responsive design
- Device discovery mode to automatically find MQTT topics
- Quick setup presets (Basic, Detailed, Individual Inverters)
- Custom device selection with manual MQTT topic configuration
- Offline detection with configurable thresholds (5-120 minutes)
- Smart data validation to filter invalid messages
- Health monitoring for device connectivity tracking
- Configurable energy percentage calculation
- Support for multiple HomeKit device types:
  - Light Sensor (Power output)
  - Contact Sensor (Production status)
  - Humidity Sensor (Energy production)
  - Temperature Sensor (Inverter temperature)

### Features
- **Device Discovery**: Automatic MQTT topic discovery and listing
- **Preset Configurations**: One-click setup for common use cases
- **Mobile-Friendly UI**: Responsive design for all device sizes
- **Data Validation**: Automatic filtering of error messages and invalid data
- **Offline Handling**: Intelligent status updates when solar system is offline
- **Health Monitoring**: Connection tracking and stale data detection
- **Progressive Configuration**: Simple setup with advanced options available

### Technical
- TypeScript implementation with full type safety
- Event-driven architecture using MQTT
- Support for Node.js >=14.18.1
- Compatible with Homebridge >=1.3.0
- Comprehensive error handling and logging
- Memory-efficient real-time data processing

### Documentation
- Comprehensive README with setup guide
- Visual GUI layout documentation
- MQTT topic reference guide
- Configuration examples for different scenarios
- Troubleshooting guide with common solutions
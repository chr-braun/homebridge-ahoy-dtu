# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-08-23

### Added
- **🌍 Multi-Language Daily Reports**: Comprehensive end-of-day solar production summaries in 5 languages
  - 🇺🇸 English, 🇩🇪 German, 🇫🇷 French, 🇮🇹 Italian, 🇨🇳 Chinese support
  - Intelligent analytics with yesterday comparisons and weekly averages
  - Weather condition detection (sunny, partly cloudy, cloudy, mixed)
  - Cultural number formatting (15.8 vs 15,8) and time display preferences
- **📱 HomeKit Motion Sensor Delivery**: Reports delivered via Motion Sensor notifications
  - Push notifications to all family devices
  - HomeKit automation and scene compatibility
  - Configurable timing (sunset-based or custom schedule)
- **📊 Smart Solar Analytics**: Comprehensive daily tracking and insights
  - Daily energy totals (Wh to kWh conversion)
  - Peak power detection with timestamps
  - Production hours calculation
  - Efficiency percentage vs configurable targets
- **🔧 Flexible Configuration**: Full customization via Homebridge UI
  - Language selection dropdown with native names
  - Multiple delivery methods (Motion Sensor, Doorbell, Switch)
  - Custom report timing or automatic sunset calculation
  - Optional comparisons and analytics

### Technical
- **Internationalization System**: Template-based i18n with JSON locale files
- **Real-time Data Integration**: Power data feeding into daily analytics
- **Build Process Enhancement**: Automatic locale file copying during compilation
- **Type Safety**: Full TypeScript support for all new features
- **Extensible Architecture**: Easy addition of new languages and features

### Documentation
- **Comprehensive Multi-Language Guide**: Detailed setup and usage instructions
- **Configuration Examples**: Sample configs for all supported languages
- **Demo Scripts**: Interactive demonstration of multi-language features
- **Updated README**: Prominent featuring of new daily reports capability

## [1.1.0] - 2024-08-23

### Added
- **Configurable Power Display**: Choose between Light Sensor (exact watts as lux) or Outlet Service (on/off state with logged watts)
- **Power Measurement Options**: New `usePowerOutlets` configuration option for intuitive power state display
- **Enhanced Documentation**: Comprehensive guides for power measurement choices with visual examples

### Fixed
- **MQTT Port Input**: Removed slider behavior for MQTT port field - now displays as proper number input
- **UI Usability**: MQTT port field no longer shows unusable slider, improved user experience

### Improved
- **HomeKit Integration**: Better power representation options to suit different user preferences
- **Configuration Schema**: Enhanced UI descriptions and help text for power measurement options
- **Backward Compatibility**: All existing configurations continue to work unchanged

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
# Changelog

All notable changes to this project will be documented in this file.

## [2.0.2-dev.2] - 2025-01-05

### Added
- **Apple Flat Design Web Interface**: Modern, clean dashboard with Apple-style design
- **Custom Sensor Names**: Individual names for all sensors via Homebridge UI
- **Historical Data Storage**: Sparse storage with compression and rolling window
- **REST API**: Complete API endpoints for data access and integration
- **Status Indicators**: MQTT connection and data availability status
- **Responsive Design**: Mobile-optimized interface for all devices
- **Unit Display**: Proper units for all sensor types (W, kWh, °C, V, A, %, Hz, dBm)
- **Real-time Charts**: Interactive graphs with Chart.js integration
- **Time Range Selection**: 1h, 6h, 24h, 7d time periods
- **Auto-refresh**: Configurable automatic data updates

### Technical Improvements
- Express web server with CORS support
- DataStorageManager class for efficient data handling
- WebInterface class with modern UI components
- Improved error handling and loading states
- TypeScript type definitions for Express and CORS
- Better sensor data formatting and display

### Changed
- Complete UI redesign with Apple Flat Design principles
- Improved sensor naming and display
- Enhanced data visualization and statistics
- Better mobile responsiveness

## [2.0.2-dev.1] - 2025-01-05

### Added
- MQTT integration for AHOY-DTU devices
- Configurable sensor selection via Homebridge UI
- Child Bridge support for better stability
- Multi-language support (German, English, French, Italian, Chinese)
- Automatic device discovery
- Offline detection and status updates

### Changed
- Complete rewrite from Kostal plugin to AHOY-DTU
- Updated package.json with new dependencies
- Improved error handling and logging

### Fixed
- Circular reference issues in Child Bridge mode
- ESLint configuration for GitHub Actions
- TypeScript compilation errors

## [2.0.1] - 2025-01-05

### Fixed
- Minor bug fixes and improvements

## [2.0.0] - 2025-01-05

### Added
- Initial release of AHOY-DTU plugin
- Basic MQTT connectivity
- HomeKit sensor integration
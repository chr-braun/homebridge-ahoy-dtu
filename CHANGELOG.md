# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-05

### Added
- **🔌 MQTT-Integration**: Direkte Verbindung zu AHOY-DTU Geräten über MQTT
- **🏠 HomeKit-Sensoren**: 7 verschiedene Sensoren für Solar-Daten
  - Solarproduktion (LightSensor) - Aktuelle Solarleistung in Watt
  - Tagesenergie (LightSensor) - Tägliche Energieerzeugung in kWh
  - Temperatur (TemperatureSensor) - Wechselrichter-Temperatur
  - Status (ContactSensor) - Online/Offline-Status
  - Spannung (LightSensor) - DC-Spannung
  - Strom (LightSensor) - DC-Strom
  - Effizienz (LightSensor) - Wechselrichter-Effizienz
- **🔍 Auto-Discovery**: Automatische Erkennung von AHOY-DTU Geräten über MQTT-Topics
- **🌍 Mehrsprachige Unterstützung**: Deutsch, Englisch, Französisch, Italienisch
- **🔧 Homebridge-UI-Integration**: Vollständige Konfiguration über die Homebridge-Benutzeroberfläche
- **🌉 Child Bridge-Unterstützung**: Plugin kann als Child Bridge ausgeführt werden
- **📊 MQTT-Topic-Abonnement**: Automatisches Abonnement aller relevanten AHOY-DTU Topics
- **⚡ Offline-Erkennung**: Intelligente Erkennung von offline-Geräten mit konfigurierbarem Schwellenwert

### Technical
- **TypeScript-Implementation**: Vollständig typisierte Codebase
- **MQTT-Client**: Verwendung von `mqtt.js` für robuste MQTT-Verbindungen
- **Event-driven Architecture**: Asynchrone Verarbeitung von MQTT-Nachrichten
- **Error Handling**: Umfassende Fehlerbehandlung und Logging
- **Memory Management**: Effiziente Speicherverwaltung für Echtzeitdaten
- **Configuration Schema**: JSON-Schema für Homebridge-UI-Integration

### Documentation
- **Vollständige README**: Detaillierte Installations- und Konfigurationsanleitung
- **GitHub-Integration**: Badges, Links und Contributing-Guide
- **Troubleshooting**: Umfassende Fehlerbehebung und Debug-Anleitung
- **MQTT-Topic-Referenz**: Dokumentation aller unterstützten MQTT-Topics
- **HomeKit-Integration**: Anleitungen für Automatisierungen und Siri-Integration

### Configuration
- **MQTT-Settings**: Host, Port, Username, Password, Client-ID
- **Device Discovery**: Automatische oder manuelle Geräteerkennung
- **Offline Threshold**: Konfigurierbare Offline-Erkennung (1-60 Minuten)
- **Language Selection**: Dropdown für Sprachauswahl
- **Debug Mode**: Detaillierte Logs für Fehlerbehebung
- **Child Bridge**: Separate Prozess-Ausführung für bessere Stabilität

### MQTT Topics
- `AHOY-DTU_TOTAL/power` - Aktuelle Solarleistung
- `AHOY-DTU_TOTAL/energy_today` - Tägliche Energieerzeugung
- `AHOY-DTU_TOTAL/energy_total` - Gesamte Energieerzeugung
- `AHOY-DTU_TOTAL/temperature` - Wechselrichter-Temperatur
- `AHOY-DTU_TOTAL/status` - Online/Offline-Status
- `AHOY-DTU_TOTAL/voltage` - DC-Spannung
- `AHOY-DTU_TOTAL/current` - DC-Strom
- `AHOY-DTU_TOTAL/efficiency` - Wechselrichter-Effizienz
- `AHOY-DTU_TOTAL/frequency` - Netzfrequenz
- `AHOY-DTU_TOTAL/rssi` - Signalstärke
- `AHOY-DTU_TOTAL/reachable` - Erreichbarkeit
- `AHOY-DTU_TOTAL/producing` - Produktionsstatus

### Breaking Changes
- **Neue Platform**: `homebridge-ahoy-dtu.AhoyDTU` (vorher Kostal-spezifisch)
- **MQTT-Only**: Keine direkte API-Integration, nur MQTT-basiert
- **Sensor-basiert**: Verwendung von HomeKit-Sensoren statt Outlets
- **Konfiguration**: Vollständig neue Konfigurationsstruktur für MQTT

### Dependencies
- **Node.js**: ^18.15.0 || ^20.7.0 || ^22
- **Homebridge**: ^1.3.0
- **MQTT**: ^5.3.4
- **TypeScript**: ^5.0.0
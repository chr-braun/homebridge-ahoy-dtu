# homebridge-ahoy-dtu

[![npm version](https://badge.fury.io/js/homebridge-ahoy-dtu.svg)](https://badge.fury.io/js/homebridge-ahoy-dtu)
[![GitHub release](https://img.shields.io/github/release/chr-braun/homebridge-ahoy-dtu.svg)](https://github.com/chr-braun/homebridge-ahoy-dtu/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Ein Homebridge-Plugin für AHOY-DTU Solar-Wechselrichter mit MQTT-Integration, historischer Datenspeicherung und modernem Web-Dashboard.

## ✨ Features

### 🔌 **MQTT-Integration**
- Direkte Verbindung zu AHOY-DTU MQTT-Broker
- Automatische Geräteerkennung
- Echtzeit-Datenübertragung

### 📱 **HomeKit-Integration**
- **Konfigurierbare Sensoren**: Wähle aus, welche Sensoren in HomeKit angezeigt werden
- **Custom Sensor Names**: Individuelle Namen für alle Sensoren
- **Child Bridge Support**: Läuft isoliert für bessere Stabilität

### 📊 **Historical Data Storage**
- **Sparsame Speicherung**: Nur alle 5 Minuten (konfigurierbar)
- **Rolling Window**: Automatische Bereinigung alter Daten
- **Komprimierung**: Entfernt ähnliche Werte für SSD-Schonung
- **Statistiken**: Min/Max/Average/Latest für jeden Sensor

### 🌐 **Web Interface**
- **Apple Flat Design**: Modernes, sauberes Dashboard
- **Echtzeit-Charts**: Interaktive Diagramme mit Chart.js
- **REST API**: Vollständige API für Datenzugriff
- **Responsive Design**: Mobile-optimiert
- **Status-Indikatoren**: MQTT-Verbindung und Datenverfügbarkeit

### 🌍 **Mehrsprachig**
Unterstützung für Deutsch, Englisch, Französisch, Italienisch und Chinesisch

## 🚀 Installation

### NPM (Empfohlen)
```bash
npm install -g homebridge-ahoy-dtu
```

### Dev-Version (Neueste Features)
```bash
npm install -g homebridge-ahoy-dtu@dev
```

## ⚙️ Konfiguration

### Basis-Konfiguration
```json
{
  "platforms": [
    {
      "platform": "homebridge-ahoy-dtu.AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqtt": {
        "host": "192.168.1.100",
        "port": 1883,
        "username": "your_username",
        "password": "your_password",
        "clientId": "homebridge-ahoy-dtu"
      },
      "discoverDevices": true,
      "offlineThresholdMinutes": 5,
      "language": "de"
    }
  ]
}
```

### Erweiterte Konfiguration
```json
{
  "platforms": [
    {
      "platform": "homebridge-ahoy-dtu.AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqtt": {
        "host": "192.168.1.100",
        "port": 1883,
        "username": "your_username",
        "password": "your_password",
        "clientId": "homebridge-ahoy-dtu"
      },
      "discoverDevices": true,
      "offlineThresholdMinutes": 5,
      "language": "de",
      "sensors": {
        "power": true,
        "energyToday": true,
        "temperature": true,
        "status": true,
        "voltage": false,
        "current": false,
        "efficiency": false,
        "frequency": false,
        "rssi": false,
        "producing": false
      },
      "customNames": {
        "power": "Meine Solaranlage",
        "energyToday": "Heute produziert",
        "temperature": "Wechselrichter Wärme",
        "status": "Online Status"
      },
      "dataStorage": {
        "enabled": true,
        "retentionHours": 24,
        "samplingInterval": 5,
        "compressionEnabled": true
      },
      "webInterface": {
        "enabled": true,
        "port": 8080,
        "refreshInterval": 30
      }
    }
  ]
}
```

## 📱 HomeKit-Sensoren

Das Plugin erstellt verschiedene HomeKit-Sensoren basierend auf den AHOY-DTU-Daten:

| Sensor | HomeKit-Typ | Beschreibung | Einheit |
|--------|-------------|--------------|---------|
| **Solarproduktion** | Light Sensor | Aktuelle Leistung | W |
| **Tagesenergie** | Light Sensor | Heute produzierte Energie | kWh |
| **Temperatur** | Temperature Sensor | Wechselrichter-Temperatur | °C |
| **Status** | Contact Sensor | Online/Offline-Status | - |
| **Spannung** | Light Sensor | DC-Spannung | V |
| **Strom** | Light Sensor | DC-Strom | A |
| **Effizienz** | Light Sensor | Wirkungsgrad | % |
| **Frequenz** | Light Sensor | Netzfrequenz | Hz |
| **RSSI** | Light Sensor | Signalstärke | dBm |
| **Produktion** | Light Sensor | Produktionsstatus | - |

## 🌐 Web Dashboard

### Zugriff
- **URL**: `http://localhost:8080/` (oder konfigurierter Port)
- **Auto-Refresh**: Alle 30 Sekunden (konfigurierbar)

### Features
- **Echtzeit-Statistiken**: Min/Max/Average/Latest für alle Sensoren
- **Interaktive Charts**: Zeitbereich 1h, 6h, 24h, 7d
- **Sensor-Auswahl**: Dropdown für verschiedene Sensoren
- **Status-Anzeige**: MQTT-Verbindung und Datenverfügbarkeit
- **Apple Flat Design**: Modernes, sauberes Interface

### REST API Endpoints
- `GET /` - Dashboard HTML
- `GET /api/sensors` - Alle verfügbaren Sensoren
- `GET /api/sensor/:sensorType/data` - Historische Daten
- `GET /api/sensor/:sensorType/stats` - Statistiken
- `GET /api/storage/stats` - Speicher-Statistiken
- `GET /api/sensors/overview` - Übersicht aller Sensoren

## 📊 Historical Data Storage

### Konfiguration
```json
"dataStorage": {
  "enabled": true,           // Aktiviert/deaktiviert
  "retentionHours": 24,      // Aufbewahrungszeit in Stunden
  "samplingInterval": 5,     // Sampling-Intervall in Minuten
  "compressionEnabled": true // Komprimierung aktiviert
}
```

### Features
- **Sparsame Speicherung**: Nur alle 5 Minuten (konfigurierbar)
- **Rolling Window**: Automatische Bereinigung alter Daten
- **Komprimierung**: Entfernt ähnliche Werte (1% Schwellenwert)
- **SSD-Schonung**: Optimiert für Flash-Speicher
- **Statistiken**: Min/Max/Average/Latest für jeden Sensor

## 🔧 MQTT-Topics

Das Plugin abonniert folgende MQTT-Topics:

- `AHOY-DTU_TOTAL/power` - Aktuelle Leistung
- `AHOY-DTU_TOTAL/energy_today` - Tagesenergie
- `AHOY-DTU_TOTAL/temperature` - Temperatur
- `AHOY-DTU_TOTAL/status` - Status
- `AHOY-DTU_TOTAL/voltage` - Spannung
- `AHOY-DTU_TOTAL/current` - Strom
- `AHOY-DTU_TOTAL/efficiency` - Effizienz
- `AHOY-DTU_TOTAL/frequency` - Frequenz
- `AHOY-DTU_TOTAL/rssi` - Signalstärke
- `AHOY-DTU_TOTAL/producing` - Produktionsstatus

## 🛠️ Troubleshooting

### Plugin wird nicht geladen
- Überprüfe die MQTT-Verbindung
- Stelle sicher, dass die MQTT-Credentials korrekt sind
- Prüfe die Homebridge-Logs auf Fehler

### Keine Sensoren sichtbar
- Warte auf MQTT-Daten (nur während der Produktion verfügbar)
- Überprüfe die MQTT-Topic-Struktur
- Stelle sicher, dass `discoverDevices` auf `true` gesetzt ist

### Web Interface nicht erreichbar
- Überprüfe den konfigurierten Port (Standard: 8080)
- Stelle sicher, dass `webInterface.enabled` auf `true` gesetzt ist
- Prüfe die Firewall-Einstellungen

### Sensoren zeigen falsche Werte
- Überprüfe die MQTT-Datenqualität
- Stelle sicher, dass die AHOY-DTU-Firmware aktuell ist
- Prüfe die Custom Names-Konfiguration

## 📈 Changelog

### v2.0.2-dev.2 (Latest)
- ✨ **Apple Flat Design Web Interface**
- ✨ **Custom Sensor Names**
- ✨ **Historical Data Storage mit Komprimierung**
- ✨ **REST API für Datenzugriff**
- ✨ **Status-Indikatoren und Echtzeit-Updates**
- ✨ **Responsive Design für Mobile**
- 🔧 **Verbesserte Fehlerbehandlung**
- 📚 **Vollständige Dokumentation**

### v2.0.2-dev.1
- ✨ **MQTT-Integration**
- ✨ **Konfigurierbare Sensoren**
- ✨ **Child Bridge Support**
- ✨ **Mehrsprachige Unterstützung**

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue.

### Entwicklung
```bash
git clone https://github.com/chr-braun/homebridge-ahoy-dtu.git
cd homebridge-ahoy-dtu
npm install
npm run build
```

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🔗 Links

- **Repository**: [https://github.com/chr-braun/homebridge-ahoy-dtu](https://github.com/chr-braun/homebridge-ahoy-dtu)
- **Issues**: [https://github.com/chr-braun/homebridge-ahoy-dtu/issues](https://github.com/chr-braun/homebridge-ahoy-dtu/issues)
- **Releases**: [https://github.com/chr-braun/homebridge-ahoy-dtu/releases](https://github.com/chr-braun/homebridge-ahoy-dtu/releases)
- **NPM**: [https://www.npmjs.com/package/homebridge-ahoy-dtu](https://www.npmjs.com/package/homebridge-ahoy-dtu)

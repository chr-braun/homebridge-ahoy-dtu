# Homebridge Kostal DTU Plugin

Ein Homebridge-Plugin für Kostal PV-Wechselrichter mit MQTT-Integration und Apple Home Energy Provider Support.

## 🚀 Features

- **⚡ Kostal-spezifische MQTT-Integration**
- **🎯 Energy Provider Service** für native Apple Home Integration
- **📊 Umfassende Solar-Daten** (Leistung, Energie, Spannung, Strom, Temperatur)
- **🌍 Multi-Language Support** (Deutsch, Englisch, Französisch)
- **🔧 Konfigurierbare Presets** (Basic, Detailed, Individual)
- **📱 Tägliche Solar-Reports** mit Push-Benachrichtigungen

## 📋 Voraussetzungen

- **Homebridge** v1.6.0+
- **Node.js** v18.0.0+
- **Kostal Wechselrichter** mit MQTT-Interface
- **MQTT Broker** (z.B. Mosquitto)

## ⚙️ Installation

```bash
npm install -g homebridge-kostal-dtu@dev
```

## 🔧 Konfiguration

### Homebridge config.json:

```json
{
  "platforms": [
    {
      "platform": "KostalDTU",
      "name": "Kostal Solar",
      "mqttHost": "192.168.1.100",
      "mqttPort": 1883,
      "mqttUsername": "your_username",
      "mqttPassword": "your_password",
      "usePreset": "detailed",
      "usePowerOutlets": true,
      "uiLanguage": "de",
      "dailyReports": {
        "enabled": true,
        "language": "de",
        "time": "20:00"
      }
    }
  ]
}
```

## 📡 MQTT Topics

### Standard Kostal Topics:

| Topic | Beschreibung | Einheit |
|-------|--------------|---------|
| `kostal/status` | Online/Offline Status | - |
| `kostal/power` | Aktuelle AC-Leistung | Watt |
| `kostal/energy_today` | Tägliche Energie | kWh |
| `kostal/energy_total` | Gesamt-Energie | kWh |
| `kostal/voltage_dc` | DC-Spannung | Volt |
| `kostal/current_dc` | DC-Strom | Ampere |
| `kostal/temperature` | Wechselrichter-Temp | °C |
| `kostal/efficiency` | Wirkungsgrad | % |

## 🎯 Preset-Konfigurationen

### Basic (Grundfunktionen):
- Status, Leistung, tägliche Energie

### Detailed (Detailliert):
- Alle verfügbaren Daten
- Spannung, Strom, Temperatur, Wirkungsgrad

### Individual-Inverters:
- Für mehrere Wechselrichter
- Status, Leistung, Energie, Temperatur

## 📱 Apple Home Integration

### Energy Provider Service (iOS 16+):
- **⚡ CurrentPower** - Aktuelle Leistung in Watt
- **📊 DailyEnergy** - Tägliche Energie in kWh
- **🔋 TotalEnergy** - Gesamt-Energie in kWh

### Fallback Services:
- **Outlet Service** - Power-Status mit Watt-Anzeige
- **Light Sensor** - Leistung als Lichtstärke
- **Temperature Sensor** - Wechselrichter-Temperatur
- **Contact Sensor** - Online/Offline-Status

## 🌍 Sprache

Unterstützte Sprachen:
- 🇩🇪 **Deutsch** (Standard)
- 🇺🇸 **Englisch**
- 🇫🇷 **Französisch**

## 📊 Tägliche Reports

- **Zeit konfigurierbar** (Standard: 20:00)
- **Push-Benachrichtigungen** in Apple Home
- **Sprachspezifische Meldungen**
- **Energie-Statistiken** des Tages

## 🔍 Troubleshooting

### Plugin startet nicht:
- Überprüfe MQTT-Verbindung
- Prüfe Logs auf Fehlermeldungen
- Stelle sicher, dass Homebridge v1.6.0+ läuft

### Keine Daten in Apple Home:
- Lösche Homebridge-Cache
- Starte Homebridge neu
- Überprüfe MQTT-Topic-Konfiguration

### Energy Provider Service nicht verfügbar:
- Das Plugin verwendet automatisch Fallback-Services
- Alle Funktionen bleiben verfügbar

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei.

## 🙏 Credits

Basierend auf dem bewährten AHOY-DTU Plugin, angepasst für Kostal Wechselrichter.

---

**Viel Spaß mit deinem Kostal Solar-System! ☀️⚡**

# Homebridge Kostal Inverter

[![npm version](https://badge.fury.io/js/homebridge-kostal-inverter.svg)](https://badge.fury.io/js/homebridge-kostal-inverter)
[![Downloads](https://img.shields.io/npm/dm/homebridge-kostal-inverter.svg)](https://www.npmjs.com/package/homebridge-kostal-inverter)

Homebridge Plugin für Kostal Plenticore Wechselrichter mit **Apple Home Energy Provider** Unterstützung.

## ✨ Features

### 🏠 Apple Home Energy Provider
- **Vollständige Integration mit Apple Home Energy Dashboard**
- Automatische Erkennung als Energieanbieter in iOS 16+
- Echtzeitdaten für Solarproduktion und Hausverbrauch
- Kompatibel mit Apple Home Energy Management

### 🔌 Kostal Plenticore Plus 5.5 Optimiert
- **Speziell optimiert für Kostal Plenticore Plus 5.5**
- Unterstützung für alle Plenticore Plus Varianten
- 3 PV-String Unterstützung (DC1, DC2, DC3)
- Vollständige Batterie-Integration

### 📊 Umfassende Datenpunkte
- **Hausverbrauch** (auch bei Nacht verfügbar)
- **PV-Leistung** und Energieerzeugung
- **Batterie-Status** und Ladezustand
- **Netzleistung** und Einspeisung
- **Wechselrichter-Temperatur**
- **Produktionsstatus**

### 🏠 Home Assistant Kompatibel
- **Basierend auf offizieller Home Assistant Integration**
- Verwendet gleiche API-Endpunkte
- Kompatibel mit `pykoplenti` Python-Bibliothek
- Getestet mit Home Assistant Kostal Plenticore Integration

## 🚀 Installation

```bash
npm install -g homebridge-kostal-inverter
```

## ⚙️ Konfiguration

Füge die folgende Konfiguration zu deiner `config.json` hinzu:

```json
{
  "platforms": [
    {
      "platform": "KostalInverter",
      "name": "Kostal Plenticore",
        "host": "192.168.1.100",
        "port": 80,
      "username": "kostal",
      "password": "dein-passwort",
      "strings": 3,
      "updateInterval": 30,
      "debug": false,
      "energyProvider": {
        "enabled": true,
        "name": "Kostal Solar"
      }
    }
  ]
}
```

### Konfigurationsoptionen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `host` | string | - | IP-Adresse des Kostal Wechselrichters |
| `port` | number | 80 | Port des Wechselrichters |
| `username` | string | - | Benutzername für die Anmeldung |
| `password` | string | - | Passwort für die Anmeldung |
| `strings` | number | 3 | Anzahl der PV-Strings |
| `updateInterval` | number | 30 | Aktualisierungsintervall in Sekunden |
| `debug` | boolean | false | Detaillierte Debug-Logs aktivieren |
| `energyProvider.enabled` | boolean | true | Apple Home Energy Provider aktivieren |
| `energyProvider.name` | string | "Kostal Solar" | Name des Energy Providers |

## 🏠 Apple Home Integration

### Energy Dashboard
Das Plugin erscheint automatisch im Apple Home Energy Dashboard als:
- **Energieanbieter**: Kostal Solar
- **Produktionsstatus**: PRODUCING/NOT_PRODUCING
- **Energieerzeugung**: Echtzeitdaten

### HomeKit Services
- **Outlet Service**: Energy Provider (Apple Home Energy Provider)
- **Light Sensor**: Solar-Leistung
- **Temperature Sensor**: Wechselrichter-Temperatur
- **Contact Sensor**: Produktionsstatus

## 🔧 Unterstützte Wechselrichter

### Vollständig getestet
- ✅ **Kostal Plenticore Plus 5.5**
- ✅ **Kostal Plenticore Plus** (alle Varianten)
- ✅ **Kostal Plenticore** (alle Varianten)

### Unterstützte Features
- ✅ **PV-Strings**: Bis zu 3 Strings (DC1, DC2, DC3)
- ✅ **Batterie-System**: Vollständige Integration
- ✅ **KSEM/Powermeter**: Hausverbrauch-Daten
- ✅ **Netzintegration**: Einspeisung und Bezug

## 📊 Verfügbare Datenpunkte

### Hauptdatenpunkte
- `Home_P` - Hausverbrauch (auch bei Nacht)
- `Grid_P` - Netzleistung
- `PV_P` - PV-Leistung
- `Battery_P` - Batterie-Leistung
- `Inverter:State` - Wechselrichter-Status

### Erweiterte Datenpunkte
- `HomeOwn_P` - Eigenverbrauch
- `HomePv_P` - PV-Eigenverbrauch
- `HomeGrid_P` - Netzbezug
- `HomeBat_P` - Batterie-Entladung
- `Bat2Grid_P` - Batterie-Einspeisung
- `Grid2Bat_P` - Netz-Batterieladung
- `PV2Bat_P` - PV-Batterieladung

## 🐛 Troubleshooting

### Debug-Modus aktivieren
```json
{
  "debug": true
}
```

### Logs überprüfen
```bash
tail -f ~/.homebridge/homebridge.log
```

### Häufige Probleme

#### Keine Daten bei Nacht
- **Normal**: PV-Leistung ist 0W bei Nacht
- **Hausverbrauch**: Sollte verfügbar sein (falls KSEM installiert)

#### Verbindungsfehler
- **IP-Adresse prüfen**: Korrekte IP des Wechselrichters
- **Anmeldedaten prüfen**: Username/Password korrekt
- **Netzwerk prüfen**: Wechselrichter erreichbar

#### Energy Provider erscheint nicht
- **iOS 16+ erforderlich**: Energy Dashboard nur in iOS 16+
- **Homebridge neu starten**: Nach Plugin-Installation
- **Apple Home App**: Energy Dashboard überprüfen

## 🔄 Updates

### Von Version 1.0.x zu 1.1.0
```bash
npm install -g homebridge-kostal-inverter@latest
sudo systemctl restart homebridge
```

### Automatische Migration
- Bestehende Konfigurationen bleiben kompatibel
- Neue Features sind optional aktivierbar
- Keine manuellen Änderungen erforderlich

## 🤝 Home Assistant Integration

### Kompatibilität
- **Gleiche API-Endpunkte** wie Home Assistant
- **Identische Datenstrukturen** wie `pykoplenti`
- **Getestet mit** Home Assistant Kostal Plenticore Integration

### Referenz
- [Home Assistant Kostal Plenticore Integration](https://www.home-assistant.io/integrations/kostal_plenticore)
- [pykoplenti Python Library](https://github.com/stegm/pykoplenti)

## 📝 Changelog

### Version 1.1.0
- ✨ Apple Home Energy Provider Integration
- 🔧 Kostal Plenticore Plus 5.5 Optimierung
- 📊 Erweiterte Datenpunkte
- 🏠 Home Assistant Kompatibilität
- 🐛 TypeScript-Fixes
- 📚 Umfassende Dokumentation

### Version 1.0.0
- 🎉 Initial Release
- 🔌 Basis-Kostal Integration
- 🏠 HomeKit-Services

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📞 Support

- **GitHub Issues**: Für Bug-Reports und Feature-Requests
- **Home Assistant Community**: Für allgemeine Fragen
- **Kostal Dokumentation**: Für Wechselrichter-spezifische Fragen

---

**Version 1.1.0** - Vollständig kompatibel mit Apple Home Energy Provider und optimiert für Kostal Plenticore Plus 5.5
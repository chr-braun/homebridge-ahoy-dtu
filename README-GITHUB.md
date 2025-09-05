# 🏠 Homebridge Kostal Inverter Plugin

<div align="center">

![Homebridge Kostal Inverter](https://via.placeholder.com/800x400/667eea/ffffff?text=Kostal+Solar+Monitoring+in+HomeKit)

[![npm version](https://badge.fury.io/js/homebridge-kostal-inverter.svg)](https://badge.fury.io/js/homebridge-kostal-inverter)
[![npm downloads](https://img.shields.io/npm/dm/homebridge-kostal-inverter.svg)](https://www.npmjs.com/package/homebridge-kostal-inverter)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![GitHub stars](https://img.shields.io/github/stars/yourusername/homebridge-kostal-inverter?style=social)](https://github.com/yourusername/homebridge-kostal-inverter/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/homebridge-kostal-inverter)](https://github.com/yourusername/homebridge-kostal-inverter/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/homebridge-kostal-inverter)](https://github.com/yourusername/homebridge-kostal-inverter/commits/main)

**Überwachen Sie Ihren Kostal-Solarwechselrichter in Apple HomeKit mit HTTP API-Integration und Energy Provider Support**

[Installation](#-installation) • [Konfiguration](#-konfiguration) • [Features](#-features) • [Dokumentation](#-dokumentation) • [Support](#-support)

</div>

## 🌟 Features

- **🍃 Apple Home Energy Provider**: Vollständige Integration als Energieerzeuger in iOS 16+
- **🌐 HTTP API Integration**: Direkte Verbindung zu Kostal-Wechselrichtern über HTTP/REST API
- **🌍 Mehrsprachige Unterstützung**: Deutsch, Englisch, Französisch, Italienisch und Chinesisch
- **🔌 Child Bridge**: Läuft als separate Bridge für bessere Stabilität
- **🏠 HomeKit Integration**: Vollständige Integration in Apple Home
- **⚡ Echtzeit-Daten**: Automatisches Polling der Wechselrichter-Daten
- **⚙️ Flexible Konfiguration**: Unterstützung für verschiedene Wechselrichter-Modelle

## 📋 Voraussetzungen

- Node.js 18.0.0 oder höher
- Homebridge 1.6.0 oder höher
- Kostal-Solarwechselrichter mit HTTP API (Plenticore, Piko, etc.)
- Netzwerkverbindung zum Wechselrichter
- **iOS 16+ für Energy Provider Features** (Fallback für ältere Versionen verfügbar)

## 🚀 Installation

### Über Homebridge UI (Empfohlen)

1. Öffnen Sie die Homebridge UI
2. Gehen Sie zu "Plugins"
3. Suchen Sie nach "Kostal Inverter"
4. Klicken Sie auf "Installieren"

### Über NPM

```bash
npm install -g homebridge-kostal-inverter
```

## ⚙️ Konfiguration

### Grundkonfiguration

```json
{
  "platforms": [
    {
      "platform": "KostalInverter",
      "name": "Kostal Solar",
      "http": {
        "host": "192.168.1.100",
        "port": 80,
        "username": "admin",
        "password": "password123",
        "timeout": 10
      },
      "inverter": {
        "name": "Kostal Piko 10.0",
        "model": "Piko 10.0",
        "serialNumber": "KOSTAL123456",
        "maxPower": 10000,
        "maxEnergyPerDay": 20,
        "strings": 2
      },
      "energyProvider": {
        "enabled": true,
        "fallbackToSolarPanel": true,
        "showInEnergyWidget": true
      },
      "language": "de",
      "childBridge": false,
      "updateInterval": 30,
      "debug": false
    }
  ]
}
```

### Konfigurationsoptionen

#### HTTP API Konfiguration
- **host**: IP-Adresse des Wechselrichters (erforderlich)
- **port**: HTTP-Port (Standard: 80)
- **username**: Benutzername für API-Authentifizierung
- **password**: Passwort für API-Authentifizierung
- **timeout**: Timeout für HTTP-Requests in Sekunden

#### Wechselrichter-Konfiguration
- **name**: Anzeigename des Wechselrichters
- **model**: Modell des Wechselrichters
- **serialNumber**: Seriennummer
- **maxPower**: Maximale Leistung in Watt
- **maxEnergyPerDay**: Maximale Tagesenergie in kWh
- **strings**: Anzahl der DC-Strings

#### Energy Provider Einstellungen
- **enabled**: Energy Provider aktivieren (iOS 16+)
- **fallbackToSolarPanel**: Fallback zu Solar Panel Service
- **showInEnergyWidget**: Im Apple Home Energie-Widget anzeigen

#### Allgemeine Einstellungen
- **language**: Sprache für Logs und UI
- **childBridge**: Plugin als separate Bridge laufen lassen
- **updateInterval**: Intervall für Daten-Updates in Sekunden
- **debug**: Debug-Modus aktivieren

## 🔌 HomeKit Integration

### 🍃 Energy Provider (iOS 16+)

Das Plugin erstellt automatisch einen **Apple Home Energy Provider Service** mit:

- **Current Power Generation**: Aktuelle Leistungserzeugung in Watt
- **Total Energy Generated**: Gesamte erzeugte Energie in kWh
- **Energy Provider Status**: Produktionsstatus (PRODUCING/NOT_PRODUCING)

### Fallback Services (ältere iOS-Versionen)

Falls der Energy Provider nicht verfügbar ist:

- **Solar Panel**: Zeigt die aktuelle Leistung an
- **Temperature Sensor**: Wechselrichter-Temperatur
- **Humidity Sensor**: Tagesenergie als Prozentwert
- **Contact Sensor**: Produktionsstatus (aktiv/inaktiv)

### String-Monitoring
- **Light Sensor**: String-Leistung
- **Light Sensor**: String-Spannung

## 🍃 Apple Home Energy Widget

Mit iOS 16+ wird Ihr Kostal-Wechselrichter automatisch im **Apple Home Energie-Widget** angezeigt:

- **Echtzeit-Leistungserzeugung** in Watt
- **Tagesenergie** in kWh
- **Produktionsstatus** (aktiv/inaktiv)
- **Integration** mit anderen Energiegeräten

## 🌐 Unterstützte Sprachen

- 🇩🇪 Deutsch (Standard)
- 🇺🇸 English
- 🇫🇷 Français
- 🇮🇹 Italiano
- 🇨🇳 中文

## 🔧 Child Bridge

Für bessere Stabilität können Sie das Plugin als Child Bridge laufen lassen:

```json
{
  "childBridge": true,
  "childBridgePort": 8581
}
```

## 🐛 Fehlerbehebung

### Häufige Probleme

1. **Verbindungsfehler**: Überprüfen Sie die IP-Adresse und Netzwerkverbindung
2. **Authentifizierungsfehler**: Überprüfen Sie Benutzername und Passwort
3. **Timeout-Fehler**: Erhöhen Sie den Timeout-Wert in der Konfiguration
4. **Energy Provider nicht sichtbar**: Stellen Sie sicher, dass iOS 16+ verwendet wird

### Debug-Modus

Aktivieren Sie den Debug-Modus für detaillierte Logs:

```json
{
  "debug": true
}
```

## 📊 API-Endpunkte

Das Plugin verwendet folgende Kostal Plenticore API-Endpunkte:

- `/api/v1/processdata`: Prozessdaten (Leistung, Energie)
- `/api/v1/system`: Systemdaten (Temperatur, Status)
- `/api/v1/device`: Gerätedaten (Strings, Spannungen)

## 🤝 Beitragen

Beiträge sind willkommen! Bitte lesen Sie unsere [Contributing Guidelines](CONTRIBUTING.md).

### Entwicklung

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie den Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

### Code-Stil

- Verwenden Sie TypeScript
- Folgen Sie den ESLint-Richtlinien
- Schreiben Sie aussagekräftige Commit-Nachrichten
- Aktualisieren Sie die Dokumentation bei Änderungen

## 📝 Changelog

Siehe [CHANGELOG.md](CHANGELOG.md) für eine vollständige Versionshistorie.

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- Homebridge-Team für die großartige Plattform
- Apple für den Energy Provider Service
- Kostal für die offene API-Dokumentation
- Alle Mitwirkenden und Tester

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfen Sie die [Issues](https://github.com/yourusername/homebridge-kostal-inverter/issues)
2. Erstellen Sie ein neues Issue mit detaillierten Informationen
3. Fügen Sie Logs und Konfiguration hinzu
4. Nutzen Sie die [GitHub Discussions](https://github.com/yourusername/homebridge-kostal-inverter/discussions)

## 🌟 Stargazers

[![Stargazers repo roster for @yourusername/homebridge-kostal-inverter](https://reporoster.com/stars/yourusername/homebridge-kostal-inverter)](https://github.com/yourusername/homebridge-kostal-inverter/stargazers)

---

**Entwickelt mit ❤️ für die Homebridge-Community und die Zukunft der erneuerbaren Energien** 🍃⚡

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/homebridge-kostal-inverter)
[![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/homebridge-kostal-inverter)
[![Homebridge](https://img.shields.io/badge/Homebridge-494D5B?style=for-the-badge&logo=homebridge&logoColor=white)](https://homebridge.io)

</div>

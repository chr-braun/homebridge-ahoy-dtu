# Homebridge Kostal Inverter Plugin

<div align="center">

![Homebridge Kostal Inverter](https://via.placeholder.com/800x400/667eea/ffffff?text=Kostal+Solar+Monitoring+in+HomeKit)

[![npm version](https://badge.fury.io/js/homebridge-kostal-inverter.svg)](https://badge.fury.io/js/homebridge-kostal-inverter)
[![npm downloads](https://img.shields.io/npm/dm/homebridge-kostal-inverter.svg)](https://www.npmjs.com/package/homebridge-kostal-inverter)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/homebridge-kostal-inverter?style=social)](https://github.com/yourusername/homebridge-kostal-inverter/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/homebridge-kostal-inverter)](https://github.com/yourusername/homebridge-kostal-inverter/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

## 🚀 Schnellstart

### Installation

```bash
npm install -g homebridge-kostal-inverter
```

### Grundkonfiguration

```json
{
  "platforms": [
    {
      "platform": "KostalInverter",
      "name": "Kostal Solar",
      "http": {
        "host": "192.168.1.100",
        "port": 80
      },
      "inverter": {
        "name": "Kostal Piko 10.0",
        "maxPower": 10000
      }
    }
  ]
}
```

## 📊 HomeKit Integration

### Energy Provider (iOS 16+)

- **Current Power Generation**: Aktuelle Leistungserzeugung in Watt
- **Total Energy Generated**: Gesamte erzeugte Energie in kWh
- **Energy Provider Status**: Produktionsstatus (PRODUCING/NOT_PRODUCING)

### Fallback Services

- **Solar Panel**: Leistungsanzeige für ältere iOS-Versionen
- **Temperature Sensor**: Wechselrichter-Temperatur
- **Contact Sensor**: Produktionsstatus

## 🔧 Konfiguration

### HTTP API Einstellungen

- **Host**: IP-Adresse Ihres Kostal-Wechselrichters
- **Port**: HTTP-Port (Standard: 80)
- **Authentifizierung**: Benutzername/Passwort (falls erforderlich)
- **Timeout**: Konfigurierbare Timeouts

### Wechselrichter-Einstellungen

- **Name & Modell**: Anpassbare Bezeichnungen
- **Maximale Leistung**: Für Prozentberechnungen
- **String-Konfiguration**: Unterstützung für mehrere DC-Strings

## 🌐 Unterstützte Sprachen

- 🇩🇪 Deutsch (Standard)
- 🇺🇸 English
- 🇫🇷 Français
- 🇮🇹 Italiano
- 🇨🇳 中文

## 📱 Apple Home Energy Widget

Mit iOS 16+ wird Ihr Kostal-Wechselrichter automatisch im **Apple Home Energie-Widget** angezeigt:

- Echtzeit-Leistungserzeugung
- Tagesenergie-Übersicht
- Produktionsstatus
- Integration mit anderen Energiegeräten

## 🐛 Support

- **GitHub Issues**: [Bug melden](https://github.com/yourusername/homebridge-kostal-inverter/issues)
- **Dokumentation**: [Vollständige Anleitung](README.md)
- **Beispiele**: [Konfigurationsbeispiele](example-kostal-http-config.json)

## 🤝 Beitragen

Beiträge sind willkommen! Bitte lesen Sie unsere [Contributing Guidelines](CONTRIBUTING.md).

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

---

**Entwickelt mit ❤️ für die Homebridge-Community und die Zukunft der erneuerbaren Energien** 🍃⚡

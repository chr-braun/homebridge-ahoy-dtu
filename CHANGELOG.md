# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [1.1.0] - 2025-01-02

### 🚀 Neue Features

#### Apple Home Energy Provider Integration
- **Vollständige Apple Home Energy Provider Funktionalität implementiert**
  - Verwendet HomeKit `Outlet` Service als Workaround für Energy Provider
  - `On` Characteristic zeigt Produktionsstatus (PRODUCING/NOT_PRODUCING)
  - `OutletInUse` Characteristic zeigt Energieerzeugung (true/false)
  - Vollständig kompatibel mit iOS 16+ Energy Dashboard

#### Erweiterte Kostal Plenticore Plus 5.5 Unterstützung
- **Optimiert für Kostal Plenticore Plus 5.5 Wechselrichter**
  - Spezifische API-Endpunkte für Plenticore Plus implementiert
  - Erweiterte Datenpunkte für alle verfügbaren Module
  - Unterstützung für 3 PV-Strings (DC1, DC2, DC3)
  - Batterie-Integration mit vollständigen Datenpunkten

#### Home Assistant Integration Kompatibilität
- **Basierend auf offizieller Home Assistant Kostal Plenticore Integration**
  - Verwendet gleiche API-Endpunkte wie Home Assistant
  - Unterstützt alle Datenpunkte aus der Home Assistant Diagnose
  - Kompatibel mit `pykoplenti` Python-Bibliothek Datenstrukturen

#### Erweiterte Datenpunkte
- **Vollständige Abdeckung aller verfügbaren Daten:**
  - `Home_P` - Hausverbrauch (auch bei Nacht verfügbar)
  - `Grid_P` - Netzleistung
  - `PV_P` - PV-Leistung
  - `Battery_P` - Batterie-Leistung
  - `Inverter:State` - Wechselrichter-Status
  - Und viele weitere...

### 🔧 Verbesserungen

#### API-Optimierungen
- **HTTP Basic Authentication implementiert**
- **Robuste Fehlerbehandlung für API-Aufrufe**
- **Timeout-Behandlung für langsame Verbindungen**

#### Daten-Extraktion
- **Intelligente Daten-Extraktion**
- **Automatische Erkennung verfügbarer Module**
- **Umfassende Logging-Funktionalität**

### 🐛 Bugfixes

#### TypeScript-Kompatibilität
- **Alle TypeScript-Fehler behoben**
- **Korrekte Typisierung für alle API-Aufrufe**

#### HomeKit-Integration
- **Verbesserte HomeKit-Kompatibilität**
- **Stabile Accessory-Erstellung**

### 📊 Technische Details

#### Unterstützte Wechselrichter
- **Kostal Plenticore Plus 5.5** (vollständig getestet)
- **Kostal Plenticore Plus** (alle Varianten)
- **Kostal Plenticore** (alle Varianten)

#### HomeKit-Services
- **Outlet Service** - Energy Provider (Apple Home Energy Provider)
- **LightSensor Service** - Solar-Leistung
- **TemperatureSensor Service** - Wechselrichter-Temperatur
- **ContactSensor Service** - Produktionsstatus

---

## [1.0.0] - 2024-12-XX

### 🎉 Initial Release
- Grundlegende Kostal Plenticore Integration
- Basis-HomeKit-Services
- Einfache Konfiguration
- REST API-Unterstützung
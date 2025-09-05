# 📁 Projektstruktur-Übersicht

> **Zwei separate Homebridge-Plugins in separaten Verzeichnissen**

## 🏗️ Verzeichnisstruktur

```
📁 Downloads/
├── 📁 homebridge-ahoy-dtu-clean/          # AHOY-DTU Plugin (Hauptverzeichnis)
│   ├── 📄 README.md                       # Haupt-README für GitHub
│   ├── 📄 README-DEV.md                   # Dev-Branch README
│   ├── 📄 package.json                    # AHOY-DTU Konfiguration
│   ├── 📄 config.schema.json              # AHOY-DTU UI Schema
│   ├── 📁 src/                            # AHOY-DTU Source Code
│   └── 📁 .git/                           # AHOY-DTU Git Repository
│
├── 📁 homebridge-kostal-inverter/         # Kostal Plugin (Hauptverzeichnis)
│   ├── 📄 README.md                       # Haupt-README für GitHub
│   ├── 📄 README-DEV.md                   # Dev-Branch README
│   ├── 📄 package.json                    # Kostal Konfiguration
│   ├── 📄 config.schema.json              # Kostal UI Schema
│   ├── 📁 src/                            # Kostal Source Code
│   └── 📁 .git/                           # Kostal Git Repository
│
└── 📁 homebridge-ahoy-dtu/                # Ursprüngliches Verzeichnis (Kostal-Dev-Branch)
    ├── 📄 package.json                    # Kostal-Plugin Konfiguration
    ├── 📁 src/                            # Kostal Source Code
    └── 📁 .git/                           # Kostal-Dev-Branch Repository
```

## 🔄 Git-Branch-Strategie

### AHOY-DTU Plugin (`homebridge-ahoy-dtu-clean/`)
- **`main`**: Stabile Version mit bewährten Features
- **`dev`**: Entwicklungsversion mit experimentellen Features
- **Repository**: `https://github.com/chr-braun/homebridge-ahoy-dtu.git`

### Kostal Plugin (`homebridge-kostal-inverter/`)
- **`main`**: Stabile Version für Kostal-Wechselrichter
- **`dev`**: Entwicklungsversion mit neuesten Features
- **Repository**: `https://github.com/yourusername/homebridge-kostal-inverter.git`

## 📦 NPM-Pakete

### AHOY-DTU Plugin
- **Name**: `homebridge-ahoy-dtu`
- **Stable**: `npm install -g homebridge-ahoy-dtu`
- **Dev**: `npm install -g homebridge-ahoy-dtu@dev`
- **Version**: `1.3.0-dev.2`

### Kostal Plugin
- **Name**: `homebridge-kostal-inverter`
- **Stable**: `npm install -g homebridge-kostal-inverter`
- **Dev**: `npm install -g homebridge-kostal-inverter@dev`
- **Version**: `1.0.0-dev.1`

## 🎯 Unterschiede zwischen den Plugins

### AHOY-DTU Plugin
- **Ziel**: AHOY-DTU Solar-Wechselrichter
- **Features**: Multi-Language Daily Reports, Energy Provider
- **MQTT-Topics**: `AHOY-DTU_*` basiert
- **HomeKit-Services**: Light Sensor, Humidity Sensor, Contact Sensor

### Kostal Plugin
- **Ziel**: Kostal Solar-Wechselrichter
- **Features**: Multi-Language UI, Child Bridge, String-Support
- **MQTT-Topics**: `kostal/inverter/*` basiert
- **HomeKit-Services**: Solar Panel, Temperature Sensor, Light Sensor

## 🚀 Deployment-Strategie

### 1. AHOY-DTU Plugin
```bash
cd homebridge-ahoy-dtu-clean
git add .
git commit -m "Update AHOY-DTU plugin to v1.3.0"
git push origin main
npm publish --tag latest
```

### 2. Kostal Plugin
```bash
cd homebridge-kostal-inverter
git add .
git commit -m "Update Kostal plugin to v1.0.0"
git push origin main
npm publish --tag latest
```

### 3. Dev-Versionen
```bash
# AHOY-DTU Dev
cd homebridge-ahoy-dtu-clean
npm publish --tag dev

# Kostal Dev
cd homebridge-kostal-inverter
npm publish --tag dev
```

## 📚 README-Struktur

### Haupt-README (`README.md`)
- **Zielgruppe**: Endbenutzer
- **Inhalt**: Installation, Konfiguration, Features
- **Sprache**: Englisch (mit deutschen Beispielen)
- **Format**: GitHub-optimiert mit Badges

### Dev-README (`README-DEV.md`)
- **Zielgruppe**: Entwickler und Tester
- **Inhalt**: Neue Features, Breaking Changes, Testing
- **Sprache**: Englisch
- **Format**: Entwickler-freundlich mit Code-Beispielen

## 🔧 Konfigurationsdateien

### AHOY-DTU Plugin
- **`config.schema.json`**: Homebridge UI Schema für AHOY-DTU
- **`config-examples.json`**: Verschiedene Konfigurationsbeispiele
- **`example-config-with-daily-reports.json`**: Daily Reports Setup

### Kostal Plugin
- **`config.schema.json`**: Homebridge UI Schema für Kostal
- **`example-kostal-config.json`**: Kostal-spezifische Konfiguration

## 🌍 Mehrsprachige Unterstützung

### Unterstützte Sprachen
- 🇩🇪 Deutsch (de)
- 🇺🇸 English (en)
- 🇫🇷 Français (fr)
- 🇮🇹 Italiano (it)
- 🇨🇳 中文 (zh)

### Sprachdateien
- **Verzeichnis**: `src/i18n/locales/`
- **Dateien**: `de.json`, `en.json`, `fr.json`, `it.json`, `zh.json`
- **Verwendung**: Automatische Sprachauswahl basierend auf Konfiguration

## 📊 Status der Plugins

### AHOY-DTU Plugin
- ✅ **Stabil**: Bewährte Features und Funktionalität
- 🔄 **Entwicklung**: Daily Reports und UI-Verbesserungen
- 📦 **NPM**: Veröffentlicht und verfügbar
- 🏷️ **Tags**: `latest`, `dev`, `beta`, `rc`

### Kostal Plugin
- 🚧 **Entwicklung**: Neue Plugin-Entwicklung
- 🔄 **Features**: Multi-Language, Child Bridge, MQTT-Integration
- 📦 **NPM**: Dev-Version veröffentlicht
- 🏷️ **Tags**: `dev` (Entwicklungsversion)

## 🔄 Nächste Schritte

### Kurzfristig (1-2 Wochen)
1. **Repository-Setup**: GitHub-Repositories für beide Plugins
2. **CI/CD**: GitHub Actions für automatische Builds
3. **Testing**: Umfassende Tests beider Plugins
4. **Dokumentation**: Vollständige Installationsanleitungen

### Mittelfristig (1-3 Monate)
1. **Stabilisierung**: Kostal-Plugin zur stabilen Version
2. **Feature-Parity**: Vergleichbare Features in beiden Plugins
3. **Community**: Benutzer-Feedback und Bug-Reports
4. **Optimierung**: Performance und Stabilität verbessern

### Langfristig (3-6 Monate)
1. **Erweiterte Features**: Analytics, Wetter-Integration
2. **Multi-Device**: Unterstützung für komplexe Installationen
3. **API**: Externe Integrationsmöglichkeiten
4. **Professional**: Enterprise-Features für gewerbliche Nutzung

## 📞 Support und Kontakt

### AHOY-DTU Plugin
- **GitHub**: [chr-braun/homebridge-ahoy-dtu](https://github.com/chr-braun/homebridge-ahoy-dtu)
- **Issues**: Bug-Reports und Feature-Requests
- **Discussions**: Community-Diskussionen

### Kostal Plugin
- **GitHub**: [yourusername/homebridge-kostal-inverter](https://github.com/yourusername/homebridge-kostal-inverter)
- **Issues**: Bug-Reports und Feature-Requests
- **Discussions**: Community-Diskussionen

---

**Entwickelt mit ❤️ für die Homebridge-Community**

*Letzte Aktualisierung: 1. September 2025*

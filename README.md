# Homebridge AHOY-DTU

Ein Homebridge-Plugin für AHOY-DTU Solar-Wechselrichter von Hoymiles. Dieses Plugin integriert AHOY-DTU Geräte über MQTT in Apple HomeKit.

## Features

- 🔌 **MQTT-Integration**: Direkte Verbindung zu AHOY-DTU Geräten über MQTT
- 🏠 **HomeKit-Integration**: 6 verschiedene Sensoren für Solar-Daten
- 🔍 **Auto-Discovery**: Automatische Erkennung von AHOY-DTU Geräten
- 🌍 **Mehrsprachig**: Unterstützung für Deutsch, Englisch, Französisch und Italienisch
- 🔧 **Homebridge-UI**: Konfiguration über die Homebridge-Benutzeroberfläche
- 🌉 **Child Bridge**: Unterstützung für Child Bridge-Modus

## HomeKit-Sensoren

Das Plugin erstellt folgende Sensoren in HomeKit:

1. **Solarproduktion** (LightSensor) - Aktuelle Solarleistung in Watt
2. **Tagesenergie** (LightSensor) - Tägliche Energieerzeugung in kWh
3. **Temperatur** (TemperatureSensor) - Wechselrichter-Temperatur
4. **Status** (ContactSensor) - Online/Offline-Status
5. **Spannung** (LightSensor) - DC-Spannung
6. **Strom** (LightSensor) - DC-Strom
7. **Effizienz** (LightSensor) - Wechselrichter-Effizienz

## Installation

1. Installiere das Plugin über die Homebridge-UI oder über NPM:
   ```bash
   npm install -g homebridge-ahoy-dtu
   ```

2. Konfiguriere das Plugin in der Homebridge-UI:
   - **MQTT-Broker IP**: IP-Adresse deines AHOY-DTU Geräts
   - **MQTT-Port**: Standard 1883
   - **Benutzername**: MQTT-Benutzername
   - **Passwort**: MQTT-Passwort

## Konfiguration

### Über Homebridge-UI

1. Gehe zu **Plugins** → **Homebridge AHOY-DTU**
2. Klicke auf **Settings**
3. Konfiguriere die MQTT-Verbindung:
   - **MQTT-Broker IP**: IP deines AHOY-DTU Geräts
   - **MQTT-Port**: 1883 (Standard)
   - **Benutzername**: Dein MQTT-Benutzername
   - **Passwort**: Dein MQTT-Passwort
4. Speichere die Konfiguration

### Manuelle Konfiguration

```json
{
  "platforms": [
    {
      "platform": "homebridge-ahoy-dtu.AhoyDTU",
      "name": "AHOY-DTU Solar",
      "mqtt": {
        "host": "192.168.1.100",
        "port": 1883,
        "username": "dein_username",
        "password": "dein_passwort",
        "clientId": "homebridge-ahoy-dtu"
      },
      "discoverDevices": true,
      "offlineThresholdMinutes": 5,
      "language": "de"
    }
  ]
}
```

## MQTT-Topics

Das Plugin abonniert folgende MQTT-Topics:

- `AHOY-DTU_TOTAL/power` - Aktuelle Solarleistung
- `AHOY-DTU_TOTAL/energy_today` - Tägliche Energieerzeugung
- `AHOY-DTU_TOTAL/temperature` - Wechselrichter-Temperatur
- `AHOY-DTU_TOTAL/status` - Online/Offline-Status
- `AHOY-DTU_TOTAL/voltage` - DC-Spannung
- `AHOY-DTU_TOTAL/current` - DC-Strom
- `AHOY-DTU_TOTAL/efficiency` - Wechselrichter-Effizienz

## HomeKit-Integration

### Automatisierungen

Du kannst Automatisierungen in der Home-App erstellen:

- **Wenn Solarproduktion > 1000W**: Benachrichtigung senden
- **Wenn Status = Offline**: Warnung senden
- **Wenn Temperatur > 60°C**: Kühlung aktivieren

### Siri-Integration

- "Hey Siri, wie viel Solarstrom produziere ich?"
- "Hey Siri, ist der Wechselrichter online?"
- "Hey Siri, wie warm ist der Wechselrichter?"

## Troubleshooting

### Plugin wird nicht geladen

1. Prüfe die Homebridge-Logs auf Fehler
2. Stelle sicher, dass die MQTT-Konfiguration korrekt ist
3. Prüfe, ob das AHOY-DTU Gerät erreichbar ist

### Keine Daten empfangen

1. Prüfe die MQTT-Verbindung
2. Stelle sicher, dass AHOY-DTU MQTT-Daten sendet
3. Prüfe die MQTT-Topics in den Logs

### Sensoren zeigen keine Werte

1. Warte auf Solarproduktion (nur tagsüber verfügbar)
2. Prüfe die MQTT-Topics
3. Aktiviere den Debug-Modus für detaillierte Logs

## Debug-Modus

Aktiviere den Debug-Modus in der Konfiguration für detaillierte Logs:

```json
{
  "debug": true
}
```

## Unterstützung

Bei Problemen oder Fragen:

1. Prüfe die [Troubleshooting-Sektion](#troubleshooting)
2. Aktiviere den Debug-Modus
3. Erstelle ein Issue auf GitHub mit den Logs

## Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## Changelog

### v2.0.0
- Erste Version mit MQTT-Integration
- 6 HomeKit-Sensoren
- Auto-Discovery
- Mehrsprachige Unterstützung
- Homebridge-UI-Integration
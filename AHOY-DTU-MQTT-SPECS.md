# AHOY-DTU MQTT Specifications

This document outlines the MQTT topic structure and data formats used by AHOY-DTU devices for Hoymiles solar inverters.

## Topic Structure

AHOY-DTU uses a hierarchical topic structure:

```
<PREFIX>/<PARAMETER>
```

Where:
- `PREFIX` = Device identifier (e.g., `AHOY-DTU_TOTAL`, `AHOY-DTU_123456`)
- `PARAMETER` = Data type (e.g., `power`, `energy_today`, `temperature`)

## Common Topic Prefixes

| Prefix | Description |
|--------|-------------|
| `AHOY-DTU_TOTAL` | Aggregated values from all connected inverters |
| `AHOY-DTU_<serial>` | Individual inverter data (where `<serial>` is the inverter serial number) |

## Data Parameters

### Power & Energy
| Parameter | Unit | Description | Example Value |
|-----------|------|-------------|---------------|
| `power` | W | Current power output | `1250.5` |
| `energy_today` | Wh | Daily energy production | `8500` |
| `energy_total` | kWh | Total lifetime energy | `1234.56` |
| `efficiency` | % | System efficiency | `94.2` |

### Electrical Values
| Parameter | Unit | Description | Example Value |
|-----------|------|-------------|---------------|
| `voltage` | V | DC voltage | `42.1` |
| `current` | A | DC current | `8.5` |
| `frequency` | Hz | AC frequency | `50.0` |

### Status & Diagnostics
| Parameter | Unit | Description | Example Values |
|-----------|------|-------------|----------------|
| `status` | text | System status | `online`, `offline` |
| `temperature` | °C | Inverter temperature | `45.2` |
| `rssi` | dBm | Signal strength | `-65` |
| `reachable` | 0/1 | Inverter reachable | `1` |
| `producing` | 0/1 | Currently producing | `1` |

## Example Topics

### Total System Values
```
AHOY-DTU_TOTAL/power           → 1250.5    (W)
AHOY-DTU_TOTAL/energy_today    → 8500      (Wh)  
AHOY-DTU_TOTAL/energy_total    → 1234.56   (kWh)
AHOY-DTU_TOTAL/temperature     → 45.2      (°C)
AHOY-DTU_TOTAL/status          → online
AHOY-DTU_TOTAL/efficiency      → 94.2      (%)
```

### Individual Inverter Values
```
AHOY-DTU_114172220001/power        → 625.2     (W)
AHOY-DTU_114172220001/voltage      → 42.1      (V)
AHOY-DTU_114172220001/current      → 8.5       (A)
AHOY-DTU_114172220001/temperature  → 44.8      (°C)
AHOY-DTU_114172220001/frequency    → 50.0      (Hz)
AHOY-DTU_114172220001/rssi         → -65       (dBm)
```

## HomeKit Mapping Strategy

| MQTT Data Type | HomeKit Service | Characteristic | Notes |
|----------------|----------------|----------------|-------|
| `power` | LightSensor | CurrentAmbientLightLevel | Power (W) mapped to Lux |
| `energy_*` | HumiditySensor | CurrentRelativeHumidity | Energy as percentage |
| `temperature` | TemperatureSensor | CurrentTemperature | Direct mapping |
| `status` | ContactSensor | ContactSensorState | Online = Contact Not Detected |
| `voltage`, `current`, `frequency` | LightSensor | CurrentAmbientLightLevel | Numeric values as Lux |
| `efficiency`, `rssi` | LightSensor | CurrentAmbientLightLevel | Percentage/signal as Lux |

## Discovery Notes

- Use MQTT wildcard subscription `#` to discover all available topics
- Discovery period: 30 seconds recommended
- Filter out non-numeric status messages during discovery
- Auto-detect data types based on topic names and value formats

## Related Projects

- **AHOY Project**: https://github.com/lumapu/ahoy
- **OpenDTU**: https://github.com/tbnobody/OpenDTU (sister project)
- **AHOY Website**: https://ahoydtu.de

## Configuration Examples

### Discovery Mode
```json
{
  "platform": "AhoyDTU",
  "mqttHost": "192.168.1.100",
  "discoverDevices": true
}
```

### Production Mode
```json
{
  "platform": "AhoyDTU", 
  "mqttHost": "192.168.1.100",
  "discoverDevices": false,
  "selectedDevices": [
    "AHOY-DTU_TOTAL/power",
    "AHOY-DTU_TOTAL/energy_today",
    "AHOY-DTU_TOTAL/temperature",
    "AHOY-DTU_TOTAL/status"
  ]
}
```
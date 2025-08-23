# Power Measurement Options in HomeKit

## Overview

The AHOY-DTU plugin offers two different methods for displaying power measurements in Apple HomeKit, each with its own advantages and use cases.

## Option 1: Light Sensor (Default)

**Service Type:** `LightSensor`  
**Characteristic:** `CurrentAmbientLightLevel`  
**Configuration:** `usePowerOutlets: false` (default)

### How it Works
- Power values (in Watts) are displayed as "Lux" measurements
- Shows exact numeric values in the Home app
- Compatible with all HomeKit versions and devices

### Advantages
✅ **Universal Compatibility** - Works on all HomeKit devices  
✅ **Exact Values** - Shows precise wattage numbers  
✅ **Always Available** - No special HomeKit requirements  
✅ **Automation Friendly** - Easy to create automations based on power levels  

### Disadvantages
❌ **Confusing Units** - Displays "Lux" instead of "Watts"  
❌ **Not Intuitive** - Users need to understand the mapping  

### Example Display
```
Solar Power: 1,247.5 lux
```
*(Actually representing 1,247.5 Watts)*

## Option 2: Outlet Service (New)

**Service Type:** `Outlet`  
**Characteristic:** `On` + `OutletInUse`  
**Configuration:** `usePowerOutlets: true`

### How it Works
- Power is represented as an on/off outlet switch
- "On" = Solar system producing power (>0W)
- "Off" = Solar system not producing power (0W)
- Actual wattage values are logged to Homebridge logs

### Advantages
✅ **Intuitive Interface** - Clear on/off power state  
✅ **Standard HomeKit** - Uses familiar outlet representation  
✅ **Visual Status** - Easy to see at a glance if system is producing  
✅ **Automation Ready** - Perfect for "turn on when solar is producing" automations  

### Disadvantages
❌ **No Exact Values** - Doesn't show precise wattage in UI  
❌ **Binary Only** - Only shows producing/not producing status  
❌ **Log Dependent** - Need to check logs for actual power values  

### Example Display
```
Solar Power Switch: On (producing)
```
*(Log shows: "Solar Power Switch: 1,247.5W (Producing)")*

## Configuration

### Enable Outlet Service

**Via Homebridge UI:**
1. Navigate to your AHOY-DTU plugin configuration
2. Expand "Advanced Settings"
3. Enable "Use Outlet Service for Power Measurement"
4. Save and restart Homebridge

**Via config.json:**
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "usePowerOutlets": true,
  "selectedDevices": [
    "AHOY-DTU_TOTAL/power"
  ]
}
```

## Use Cases

### Choose Light Sensor When:
- You need to see exact power values in HomeKit
- Creating automations based on specific power thresholds
- Monitoring precise power generation throughout the day
- Using HomeKit dashboards that need numeric displays

### Choose Outlet Service When:
- You prefer a simple on/off power state indication
- Using automations like "turn on pool pump when solar is producing"
- Want a more intuitive HomeKit interface
- Don't need exact power values in the Home app

## Migration

### Switching From Light Sensor to Outlet
1. Enable `usePowerOutlets: true` in configuration
2. Save and restart Homebridge
3. Remove old Light Sensor accessories from HomeKit (they'll appear as "Not Responding")
4. New Outlet accessories will be created automatically

### Switching From Outlet to Light Sensor
1. Disable `usePowerOutlets: false` in configuration
2. Save and restart Homebridge
3. Remove old Outlet accessories from HomeKit
4. New Light Sensor accessories will be created automatically

## Technical Notes

- Both services use the same MQTT data source
- Configuration change requires Homebridge restart
- Existing automations may need to be recreated when switching services
- Power values are always logged regardless of service type
- Offline detection works the same way for both services

## Recommendation

**For Most Users:** Start with **Light Sensor** (default) to see exact power values, then switch to **Outlet Service** if you prefer the simpler on/off interface.

**For Advanced Users:** Use **Light Sensor** for precise monitoring and data collection.

**For Simple Monitoring:** Use **Outlet Service** for basic power state indication.
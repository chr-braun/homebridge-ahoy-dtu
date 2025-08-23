# ⚡ New Power Measurement Feature Implementation Summary

## What Was Added

The AHOY-DTU Homebridge plugin now supports **two different ways** to display power measurements in Apple HomeKit, addressing the issue that Lux (light sensor) is not an ideal unit for measuring solar power output.

## ✅ Implementation Complete

### 1. **New Configuration Option**
- Added `usePowerOutlets: boolean` to the configuration interface
- Available in Homebridge UI under "Advanced Settings"
- Default: `false` (maintains backward compatibility)

### 2. **Outlet Service Support**
- Power data can now be displayed using HomeKit's `Outlet` service
- Shows power state as On/Off (producing/not producing)
- Actual wattage values are logged to Homebridge console
- More intuitive for users who want simple power state indication

### 3. **Enhanced Configuration UI**
- Added toggle in Homebridge Config UI X
- Clear description of the feature with emoji icons
- Help text explaining the difference between options
- Located in the "Advanced Settings" expandable section

### 4. **Comprehensive Documentation**
- Created `POWER-MEASUREMENT-OPTIONS.md` with detailed comparison
- Updated main `README.md` with power measurement options
- Updated example configuration files
- Added visual comparison tables

## 🎯 How It Works

### Light Sensor Method (Default - `usePowerOutlets: false`)
```
Solar Power: 1,247.5 lux
```
- Shows exact wattage as "Lux" values
- Perfect for automations and precise monitoring
- Compatible with all HomeKit versions

### Outlet Switch Method (New - `usePowerOutlets: true`)
```
Solar Power Switch: On (producing)
```
- Shows simple on/off power state
- Logs: "Solar Power Switch: 1,247.5W (Producing)"
- More intuitive visual representation

## 📝 Configuration Examples

### Basic Configuration with Outlet Service
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "usePowerOutlets": true,
  "usePreset": "basic"
}
```

### Custom Device Selection with Outlet Service
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "usePowerOutlets": true,
  "selectedDevices": [
    "AHOY-DTU_TOTAL/power",
    "AHOY-DTU_TOTAL/energy_today",
    "AHOY-DTU_TOTAL/temperature"
  ]
}
```

## 🔄 Migration Process

When users switch between modes:
1. Change `usePowerOutlets` setting
2. Save configuration and restart Homebridge
3. Remove old accessories from HomeKit (will show as "Not Responding")
4. New accessories are created automatically with correct service type

## 📱 HomeKit Display

### Light Sensor (Default)
- Device Type: Light Sensor
- Shows: "1,250.5 lux" (representing 1,250.5 watts)
- Automation: Trigger when "illuminance is above/below X lux"

### Outlet Service (New)
- Device Type: Outlet/Switch
- Shows: "On" (producing power) or "Off" (not producing)
- Automation: Trigger when "outlet turns on/off"

## 💡 Benefits

### For Users Who Want Exact Values
- Keep using Light Sensor method
- See precise wattage numbers in HomeKit
- Perfect for detailed monitoring and complex automations

### For Users Who Want Simplicity
- Switch to Outlet Service method
- Clear visual indication of power production state
- Great for simple automations like "turn on pool pump when solar is producing"

## ✨ Technical Details

### Files Modified
- `src/index.ts` - Core implementation
- `config.schema.json` - UI configuration
- `homebridge-config-example.json` - Example configuration
- `README.md` - Documentation updates

### Backward Compatibility
- All existing configurations continue to work unchanged
- Default behavior remains Light Sensor method
- No breaking changes for existing users

### Error Handling
- Graceful fallback if outlet characteristics aren't available
- Comprehensive logging for debugging
- Offline status handling for both service types

## 🎉 Result

Users now have the choice between:
1. **Precise measurement** (Light Sensor showing watts as lux)
2. **Intuitive display** (Outlet showing on/off power state)

This addresses the original concern about Lux not being the perfect measuring unit while maintaining full backward compatibility and providing users with options that suit their monitoring preferences.
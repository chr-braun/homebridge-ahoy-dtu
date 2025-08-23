# ⚡ Power Display Demonstration - How Watts Are Shown

This document shows you exactly how power (watts) are displayed in HomeKit with both options.

## 🔍 Live Example

Let's say your solar system is currently producing **1,247.5 watts**.

---

## 📱 **Option 1: Light Sensor (Default)**
**Configuration:** `"usePowerOutlets": false` (or not set)

### What You See in HomeKit:
```
┌─────────────────────────┐
│ 💡 Solar Power          │
│                         │
│    1,247.5 lux         │
│                         │
│ ◯ Currently: 1247.5    │
└─────────────────────────┘
```

### In Home App:
- **Device Type:** Light Sensor 💡
- **Value Display:** "1,247.5 lux"
- **Unit Shown:** Lux (but actually represents watts)
- **Automation:** "When illuminance is above 1000 lux"

### Homebridge Log:
```
[AHOY-DTU] Solar Power: 1247.5W
```

---

## 🔌 **Option 2: Outlet Service (New)**
**Configuration:** `"usePowerOutlets": true`

### What You See in HomeKit:
```
┌─────────────────────────┐
│ 🔌 Solar Power Switch   │
│                         │
│       ● ON              │
│                         │
│ ◯ Currently producing   │
└─────────────────────────┘
```

### In Home App:
- **Device Type:** Outlet/Switch 🔌
- **Status Display:** "ON" (when producing) / "OFF" (when not producing)
- **Unit Shown:** None (just on/off state)
- **Automation:** "When outlet turns on" or "When outlet turns off"

### Homebridge Log:
```
[AHOY-DTU] Solar Power Switch: 1247.5W (Producing)
```

---

## 📊 **Real-World Comparison**

### Scenario: Solar System Throughout the Day

| Time | Power Output | Light Sensor Shows | Outlet Shows | Log Message |
|------|--------------|-------------------|--------------|-------------|
| 6:00 AM | 0W | 0.0001 lux | OFF | "0W (Not Producing)" |
| 9:00 AM | 500W | 500 lux | ON | "500W (Producing)" |
| 12:00 PM | 1,800W | 1,800 lux | ON | "1800W (Producing)" |
| 3:00 PM | 1,200W | 1,200 lux | ON | "1200W (Producing)" |
| 6:00 PM | 50W | 50 lux | ON | "50W (Producing)" |
| 8:00 PM | 0W | 0.0001 lux | OFF | "0W (Not Producing)" |

---

## 🎯 **Which Should You Choose?**

### Choose **Light Sensor** (Default) if:
✅ You want to see exact wattage numbers  
✅ You're creating automations based on specific power levels  
✅ You're monitoring precise power generation  
✅ You're fine with "lux" representing watts  

### Choose **Outlet Service** if:
✅ You prefer simple on/off power indication  
✅ You want intuitive HomeKit representation  
✅ You're creating automations like "when solar is producing"  
✅ You don't need exact numbers in the Home app  

---

## 🔧 **How to Switch Between Modes**

### Via Homebridge Config UI:
1. Open your AHOY-DTU plugin configuration
2. Expand "⚙️ Advanced Settings" 
3. Toggle "Use Outlet Service for Power Measurement"
4. Save and restart Homebridge

### Via config.json:
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  "usePowerOutlets": true,    // ← Add this line for outlet mode
  "selectedDevices": [
    "AHOY-DTU_TOTAL/power"
  ]
}
```

---

## 📱 **Screenshots Comparison**

### Light Sensor View:
```
Home App → Accessories → Solar Power
┌────────────────────┐
│ 💡 Solar Power     │
│                    │
│ Current Light Level│
│   1,247.5 lux     │
│                    │
│ Status: Normal     │
└────────────────────┘
```

### Outlet View:
```
Home App → Accessories → Solar Power Switch
┌────────────────────┐
│ 🔌 Solar Power     │
│    Switch          │
│                    │
│     ● ON           │
│                    │
│ Status: On         │
└────────────────────┘
```

---

## 💡 **Pro Tips**

1. **Exact Values:** If you need exact wattage numbers, check the Homebridge logs regardless of which mode you choose.

2. **Automations:** 
   - Light Sensor: "When illuminance rises above 1000 lux"
   - Outlet: "When outlet turns on"

3. **Dashboard Widgets:** Light sensors show numbers, outlets show on/off states.

4. **Migration:** When you switch modes, remove the old accessories from HomeKit first, then restart Homebridge to create new ones.

5. **Both Modes Log Watts:** Regardless of HomeKit display, actual wattage is always logged to console.

---

## 🆘 **Troubleshooting**

**Q: I don't see any power values**  
A: Check that your MQTT topic is `AHOY-DTU_TOTAL/power` and that data is being published.

**Q: Outlet shows OFF but I have power**  
A: Check logs for actual power values. Outlet only shows ON when power > 0W.

**Q: Light sensor shows 0.0001 lux**  
A: This is the minimum value when power is 0W (prevents HomeKit display issues).

**Q: Can I use both modes simultaneously?**  
A: No, choose one mode. The git tag v1.1.0configuration applies to all power devices.
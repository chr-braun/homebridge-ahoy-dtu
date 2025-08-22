# Homebridge UI Visual Layout

## GUI Interface Preview

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌞 AHOY-DTU SOLAR MONITOR                    │
│                Monitor your solar inverter in Apple HomeKit     │
└─────────────────────────────────────────────────────────────────┘

┌─ 📝 Basic Configuration ────────────────────────────────────────┐
│ Platform Name: [AHOY-DTU Solar                               ] │
└─────────────────────────────────────────────────────────────────┘

┌─ 🔌 MQTT Connection ────────────────────────────────────────────┐
│ MQTT Server IP: [192.168.1.100                              ] │
│ MQTT Port:      [1883                                       ] │
│                                                                 │
│ ▼ Authentication (Optional)                                     │
│   Username: [                                                ] │
│   Password: [                                                ] │
└─────────────────────────────────────────────────────────────────┘

┌─ 🔧 Device Setup ──────────────────────────────────────────────┐
│ 💡 Setup Methods:                                              │
│ • Discovery Mode: Find all available MQTT topics              │
│ • Quick Presets: Instant setup with predefined collections    │
│ • Custom Selection: Manually choose specific topics           │
│                                                                 │
│ Discovery Mode: [ ] Enable device discovery                    │
│                                                                 │
│ Quick Preset: [📊 Basic (Power + Energy + Status)        ▼] │
│                                                                 │
│ Custom Topics: [+ Add Topic                                   ] │
│               [AHOY-DTU_TOTAL/power                         ] │
│               [AHOY-DTU_TOTAL/energy_today                  ] │
└─────────────────────────────────────────────────────────────────┘

┌─ ⚙️ Advanced Settings ─────────────────────────────────────────┐
│ Max Daily Energy: [10.0] kWh                                   │
│ Offline Threshold: [15] minutes                                │
│                                                                 │
│ 📄 Common AHOY-DTU Topics:                                     │
│ • AHOY-DTU_TOTAL/power - Current power output                  │
│ • AHOY-DTU_TOTAL/energy_today - Daily energy production       │
│ • AHOY-DTU_TOTAL/temperature - Inverter temperature           │
│ • AHOY-DTU_123456/power - Individual inverter power           │
└─────────────────────────────────────────────────────────────────┘

┌─ 📜 Legacy Support ────────────────────────────────────────────┐
│ Legacy Topic: [AHOY-DTU_TOTAL                                ] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🚀 Quick Start Guide:                                          │
│ 1. Enter your MQTT server IP above                             │
│ 2. Enable 'Device Discovery Mode' and save                     │
│ 3. Restart Homebridge and check logs for discovered topics     │
│ 4. Disable discovery, choose a preset or add custom topics     │
│ 5. Save and restart - your solar data will appear in HomeKit!  │
└─────────────────────────────────────────────────────────────────┘

                        [Save] [Cancel]
```

## Color Scheme

### Primary Colors:
- **Header**: Gradient from #667eea to #764ba2 (purple-blue)
- **Info Boxes**: Light blue (#f0f8ff) with blue border (#0066cc)
- **Success**: Light green (#f0fdf4) with green border (#bbf7d0)
- **Warning**: Light yellow (#fff8dc) with orange border (#ffa500)

### UI Elements:
- **Buttons**: Gradient purple-blue with hover effects
- **Form Fields**: Clean borders with focus highlighting
- **Fieldsets**: Light gray background (#fafafa) with subtle borders
- **Code**: Light gray background (#f1f5f9) for topic examples

## Responsive Behavior

### Desktop (>768px):
- Full-width sections with proper spacing
- Expanded help text and descriptions
- Large, easy-to-click buttons
- Multi-column layouts where appropriate

### Mobile (<768px):
- Collapsed sections by default
- Larger touch targets
- Simplified navigation
- Optimized text sizes

## Interactive Features

### Conditional Display:
- Custom topics only shown when "Custom Selection" is chosen
- Authentication fields hidden in collapsible section
- Advanced settings collapsed by default

### Validation:
- Real-time field validation
- Required field indicators
- Format checking (IP addresses, numbers)
- Range validation with helpful error messages

### Help Integration:
- Context-sensitive help boxes
- Example values and formats
- Common topic reference guide
- Step-by-step setup instructions
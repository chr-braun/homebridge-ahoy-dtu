---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: 'bug'
assignees: ''

---

**Bug Description**
A clear and concise description of what the bug is.

**Environment**
- Plugin version: [e.g., 1.0.0]
- Homebridge version: [e.g., 1.6.0]
- Node.js version: [e.g., 16.14.0]
- Operating system: [e.g., Ubuntu 20.04, macOS 12.0, Windows 10]
- AHOY-DTU version: [if known]

**Configuration**
```json
{
  "platform": "AhoyDTU",
  "name": "AHOY-DTU Solar",
  "mqttHost": "192.168.1.100",
  // Include your configuration (remove sensitive data like passwords)
}
```

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Actual Behavior**
A clear and concise description of what actually happened.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Homebridge Logs**
```
Please include relevant log entries from Homebridge.
Look for entries containing "AHOY-DTU" or error messages.
```

**MQTT Data**
If possible, provide sample MQTT messages from your AHOY-DTU:
```
Topic: AHOY-DTU_TOTAL/power
Message: 1250.5

Topic: AHOY-DTU_TOTAL/status  
Message: online
```

**Additional Context**
Add any other context about the problem here. For example:
- Network setup details
- MQTT broker type and version
- Any recent changes to your setup
- Similar issues you've found
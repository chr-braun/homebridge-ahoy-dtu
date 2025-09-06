#!/usr/bin/env node

// Test Script für Child Bridge Funktionalität
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Test Child Bridge Setup...');

// Homebridge Konfigurationsdatei lesen
const configDir = path.join(os.homedir(), '.homebridge');
const configFile = path.join(configDir, 'config.json');

console.log(`📁 Config Dir: ${configDir}`);
console.log(`📄 Config File: ${configFile}`);

if (!fs.existsSync(configFile)) {
  console.error('❌ config.json nicht gefunden!');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
console.log('✅ Config geladen');

// Kostal Platform finden
const kostalPlatform = config.platforms?.find(p => p.platform === 'KostalInverter');

if (!kostalPlatform) {
  console.error('❌ Kostal Platform nicht in config.json gefunden!');
  process.exit(1);
}

console.log('🔍 Kostal Platform gefunden:', JSON.stringify(kostalPlatform, null, 2));

// Child Bridge Status prüfen
if (kostalPlatform.childBridge === true) {
  console.log('✅ Child Bridge ist aktiviert');
  
  // Child Bridge Konfiguration erstellen
  const childBridgeConfig = {
    bridge: {
      name: `Kostal Solar Bridge ${Math.random().toString(36).substr(2, 9)}`,
      username: generateUsername(),
      port: kostalPlatform.childBridgePort || 8581,
      pin: generatePin(),
      advertiser: 'bonjour-hap'
    },
    accessories: [],
    platforms: [
      {
        platform: 'KostalInverter',
        name: kostalPlatform.name || 'Kostal Plenticore',
        inverter: kostalPlatform.inverter || {},
        pollingInterval: kostalPlatform.pollingInterval || 30,
        pushNotifications: kostalPlatform.pushNotifications || {},
        childBridge: false // Child Bridge kann nicht in Child Bridge laufen
      }
    ]
  };

  // Child Bridge Konfigurationsdatei erstellen
  const childBridgeConfigFile = path.join(configDir, 'kostal-child-bridge.json');
  
  fs.writeFileSync(childBridgeConfigFile, JSON.stringify(childBridgeConfig, null, 2));
  
  console.log(`🔗 Child Bridge Konfiguration erstellt: ${childBridgeConfigFile}`);
  console.log(`📱 Child Bridge PIN: ${childBridgeConfig.bridge.pin}`);
  console.log(`🌐 Child Bridge Port: ${childBridgeConfig.bridge.port}`);
  
} else {
  console.log('❌ Child Bridge ist deaktiviert');
}

function generateUsername() {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 1 || i === 3 || i === 5 || i === 7) {
      result += ':';
    }
  }
  return result;
}

function generatePin() {
  const part1 = Math.floor(Math.random() * 900) + 100;
  const part2 = Math.floor(Math.random() * 90) + 10;
  const part3 = Math.floor(Math.random() * 900) + 100;
  return `${part1}-${part2}-${part3}`;
}

console.log('✅ Test abgeschlossen');

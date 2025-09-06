#!/usr/bin/env node

// Setup Script für Child Bridge
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

console.log('🔧 Setup Child Bridge für Kostal Inverter Plugin...');

// Test Script ausführen
console.log('📋 Erstelle Child Bridge Konfiguration...');
const testResult = require('child_process').execSync('node test-child-bridge.js', { encoding: 'utf8' });
console.log(testResult);

// Child Bridge Config prüfen
const configDir = path.join(os.homedir(), '.homebridge');
const childBridgeConfigFile = path.join(configDir, 'kostal-child-bridge.json');

if (!fs.existsSync(childBridgeConfigFile)) {
  console.error('❌ Child Bridge Konfiguration wurde nicht erstellt!');
  process.exit(1);
}

console.log('✅ Child Bridge Konfiguration existiert');

// Child Bridge starten
console.log('🚀 Starte Child Bridge...');
const childBridge = spawn('homebridge', ['-C', childBridgeConfigFile, '-D'], {
  stdio: 'inherit'
});

console.log(`🔗 Child Bridge PID: ${childBridge.pid}`);

// Signal Handler
process.on('SIGINT', () => {
  console.log('\n🛑 Stoppe Child Bridge...');
  childBridge.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stoppe Child Bridge...');
  childBridge.kill();
  process.exit(0);
});

// Child Bridge Exit Handler
childBridge.on('exit', (code) => {
  console.log(`🔗 Child Bridge beendet mit Code: ${code}`);
  process.exit(code);
});

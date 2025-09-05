#!/usr/bin/env node
/**
 * Test Script für Tagesreport
 */

const DailyReportGenerator = require('./generate-daily-report.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Erstelle Testdaten
function createTestData() {
  const dataDir = path.join(os.homedir(), '.homebridge', 'kostal-data');
  
  // Erstelle Datenverzeichnis
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Erstelle Testdaten für heute
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dataFile = path.join(dataDir, `${dateStr}.json`);
  
  // Simuliere einen Tag mit Solarproduktion
  const testData = [];
  const startHour = 8; // 8 Uhr morgens
  const endHour = 18;  // 18 Uhr abends
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 5) { // Alle 5 Minuten
      const timestamp = new Date(today);
      timestamp.setHours(hour, minute, 0, 0);
      
      // Simuliere Solarproduktion (Glockenkurve)
      const hourOfDay = hour + minute / 60;
      const peakHour = 13; // Mittag
      const power = Math.max(0, 5000 * Math.exp(-Math.pow((hourOfDay - peakHour) / 3, 2)));
      
      // Zufällige Variation
      const variation = (Math.random() - 0.5) * 200;
      const finalPower = Math.max(0, power + variation);
      
      testData.push({
        timestamp: timestamp.toISOString(),
        power: finalPower,
        energy: 0, // Wird berechnet
        temperature: 20 + Math.random() * 15,
        status: finalPower > 100 ? 'running' : 'off',
        is_producing: finalPower > 100
      });
    }
  }
  
  // Speichere Testdaten
  fs.writeFileSync(dataFile, JSON.stringify(testData, null, 2));
  console.log(`✅ Testdaten erstellt: ${testData.length} Datenpunkte für ${dateStr}`);
  
  return testData.length;
}

async function testDailyReport() {
  console.log('🧪 Teste Tagesreport-Generator...\n');
  
  // Erstelle Testdaten
  const dataPoints = createTestData();
  
  // Generiere Report
  const generator = new DailyReportGenerator();
  const report = await generator.generateDailyReport();
  
  // Zeige Report
  generator.printReport(report);
  
  console.log(`\n✅ Test erfolgreich! ${dataPoints} Datenpunkte verarbeitet.`);
}

// Führe Test aus
testDailyReport().catch(console.error);

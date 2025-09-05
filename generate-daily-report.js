#!/usr/bin/env node
/**
 * Kostal Tagesreport Generator
 * Generiert einen Tagesreport aus den vom Homebridge Plugin gespeicherten Daten
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class DailyReportGenerator {
  constructor() {
    this.dataDir = path.join(os.homedir(), '.homebridge', 'kostal-data');
    this.dbPath = path.join(os.homedir(), '.homebridge', 'kostal-data.db');
  }

  initDatabase() {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(this.dbPath);
    
    return new Promise((resolve) => {
      db.serialize(() => {
        // Erstelle Tabelle für tägliche Zusammenfassungen
        db.run(`
          CREATE TABLE IF NOT EXISTS daily_summaries (
            date TEXT PRIMARY KEY,
            total_energy_kwh REAL,
            max_power_watts REAL,
            avg_temperature REAL,
            production_hours REAL,
            production_start TEXT,
            production_end TEXT,
            data_points INTEGER
          )
        `, (err) => {
          if (err) {
            console.error('❌ Fehler beim Erstellen der Datenbank:', err);
          } else {
            console.log('✅ Datenbank initialisiert');
          }
          db.close();
          resolve();
        });
      });
    });
  }

  loadDailyData(date) {
    const dateStr = date.toISOString().split('T')[0];
    const dataFile = path.join(this.dataDir, `${dateStr}.json`);
    
    if (!fs.existsSync(dataFile)) {
      return [];
    }
    
    try {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (error) {
      console.error(`❌ Fehler beim Laden der Daten für ${dateStr}:`, error);
      return [];
    }
  }

  calculateTotalEnergy(dataPoints) {
    if (dataPoints.length < 2) {
      return 0;
    }
    
    let totalEnergy = 0;
    for (let i = 1; i < dataPoints.length; i++) {
      const prevTime = new Date(dataPoints[i-1].timestamp);
      const currTime = new Date(dataPoints[i].timestamp);
      const timeDiffHours = (currTime - prevTime) / (1000 * 60 * 60);
      
      // Durchschnittsleistung zwischen den Punkten
      const avgPower = (dataPoints[i-1].power + dataPoints[i].power) / 2;
      
      // Energie = Leistung * Zeit (W zu kW)
      const energy = (avgPower * timeDiffHours) / 1000;
      totalEnergy += energy;
    }
    
    return totalEnergy;
  }

  calculateProductionTimes(dataPoints) {
    const productionPeriods = [];
    let currentStart = null;
    
    for (const point of dataPoints) {
      const isProducing = point.is_producing;
      const timestamp = point.timestamp;
      
      if (isProducing && !currentStart) {
        currentStart = timestamp;
      } else if (!isProducing && currentStart) {
        productionPeriods.push([currentStart, timestamp]);
        currentStart = null;
      }
    }
    
    // Wenn am Ende des Tages noch produziert wird
    if (currentStart) {
      productionPeriods.push([currentStart, dataPoints[dataPoints.length - 1].timestamp]);
    }
    
    // Berechne Gesamtstunden
    let totalHours = 0;
    for (const [start, end] of productionPeriods) {
      const startDt = new Date(start);
      const endDt = new Date(end);
      totalHours += (endDt - startDt) / (1000 * 60 * 60);
    }
    
    return {
      total_hours: totalHours,
      start_time: productionPeriods[0] ? productionPeriods[0][0] : null,
      end_time: productionPeriods[productionPeriods.length - 1] ? productionPeriods[productionPeriods.length - 1][1] : null,
      periods: productionPeriods.length
    };
  }

  async generateDailyReport(date = new Date()) {
    // Initialisiere Datenbank
    await this.initDatabase();
    
    const dataPoints = this.loadDailyData(date);
    
    if (dataPoints.length === 0) {
      return this.createEmptyReport(date);
    }
    
    // Berechne Statistiken
    const totalEnergy = this.calculateTotalEnergy(dataPoints);
    const maxPower = Math.max(...dataPoints.map(p => p.power));
    const avgTemperature = dataPoints.reduce((sum, p) => sum + p.temperature, 0) / dataPoints.length;
    
    // Produktionszeiten
    const productionTimes = this.calculateProductionTimes(dataPoints);
    
    // Vergleichswerte berechnen
    const comparisons = await this.calculateComparisons(date);
    
    const report = {
      date: date.toISOString().split('T')[0],
      total_energy_kwh: Math.round(totalEnergy * 1000) / 1000,
      max_power_watts: Math.round(maxPower * 10) / 10,
      avg_temperature_celsius: Math.round(avgTemperature * 10) / 10,
      production_hours: Math.round(productionTimes.total_hours * 100) / 100,
      production_start: productionTimes.start_time,
      production_end: productionTimes.end_time,
      data_points: dataPoints.length,
      status: totalEnergy > 0 ? 'SUCCESS' : 'NO_PRODUCTION',
      comparisons: comparisons
    };
    
    // Speichere Zusammenfassung in DB
    await this.saveDailySummary(report);
    
    return report;
  }

  async calculateComparisons(date) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(this.dbPath);
    
    return new Promise((resolve) => {
      const comparisons = {};
      
      // Vorheriger Tag
      const prevDay = new Date(date);
      prevDay.setDate(prevDay.getDate() - 1);
      
      db.get('SELECT total_energy_kwh FROM daily_summaries WHERE date = ?', 
        [prevDay.toISOString().split('T')[0]], (err, row) => {
        if (err) {
          console.error('❌ Fehler beim Abrufen der Vergleichsdaten:', err);
          resolve(comparisons);
          return;
        }
        
        comparisons.previous_day = {
          date: prevDay.toISOString().split('T')[0],
          energy_kwh: row ? Math.round(row.total_energy_kwh * 1000) / 1000 : 0,
          available: !!row
        };
        
        // Wochendurchschnitt (letzte 7 Tage)
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - 6);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() - 1);
        
        db.get(`
          SELECT AVG(total_energy_kwh) as avg_energy, COUNT(*) as days_count 
          FROM daily_summaries 
          WHERE date BETWEEN ? AND ?
        `, [weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]], (err, row) => {
          if (err) {
            console.error('❌ Fehler beim Abrufen der Wochendaten:', err);
            resolve(comparisons);
            return;
          }
          
          comparisons.week_average = {
            period: `${weekStart.toISOString().split('T')[0]} bis ${weekEnd.toISOString().split('T')[0]}`,
            avg_energy_kwh: row ? Math.round(row.avg_energy * 1000) / 1000 : 0,
            days_count: row ? row.days_count : 0
          };
          
          db.close();
          resolve(comparisons);
        });
      });
    });
  }

  async saveDailySummary(report) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(this.dbPath);
    
    return new Promise((resolve) => {
      db.run(`
        INSERT OR REPLACE INTO daily_summaries 
        (date, total_energy_kwh, max_power_watts, avg_temperature, 
         production_hours, production_start, production_end, data_points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        report.date,
        report.total_energy_kwh,
        report.max_power_watts,
        report.avg_temperature_celsius,
        report.production_hours,
        report.production_start,
        report.production_end,
        report.data_points
      ], (err) => {
        if (err) {
          console.error('❌ Fehler beim Speichern der Zusammenfassung:', err);
        }
        db.close();
        resolve();
      });
    });
  }

  createEmptyReport(date) {
    return {
      date: date.toISOString().split('T')[0],
      total_energy_kwh: 0,
      max_power_watts: 0,
      avg_temperature_celsius: 0,
      production_hours: 0,
      production_start: null,
      production_end: null,
      data_points: 0,
      status: 'NO_DATA',
      comparisons: {}
    };
  }

  printReport(report) {
    console.log('='.repeat(70));
    console.log(`🌞 KOSTAL SOLAR TAGESREPORT - ${report.date}`);
    console.log('='.repeat(70));
    
    if (report.status === 'NO_DATA') {
      console.log('❌ Keine Daten für diesen Tag verfügbar');
      return;
    }
    
    if (report.status === 'NO_PRODUCTION') {
      console.log('⚠️  Keine Stromproduktion an diesem Tag');
      return;
    }
    
    // Hauptdaten
    console.log(`⚡ Gesamtenergie: ${report.total_energy_kwh.toFixed(3)} kWh`);
    console.log(`🔥 Max. Leistung: ${report.max_power_watts.toFixed(1)} W`);
    console.log(`🌡️  Ø Temperatur: ${report.avg_temperature_celsius.toFixed(1)} °C`);
    console.log(`⏱️  Produktionszeit: ${report.production_hours.toFixed(2)} Stunden`);
    
    if (report.production_start) {
      const startTime = new Date(report.production_start).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
      const endTime = new Date(report.production_end).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
      console.log(`🌅 Produktionsstart: ${startTime}`);
      console.log(`🌇 Produktionsende: ${endTime}`);
    }
    
    console.log(`📊 Datenpunkte: ${report.data_points}`);
    
    // Vergleichswerte
    if (report.comparisons && Object.keys(report.comparisons).length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📈 VERGLEICHSWERTE');
      console.log('='.repeat(70));
      
      const comp = report.comparisons;
      
      // Vorheriger Tag
      if (comp.previous_day && comp.previous_day.available) {
        const diff = report.total_energy_kwh - comp.previous_day.energy_kwh;
        const trend = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
        console.log(`📅 Vorheriger Tag (${comp.previous_day.date}): ${comp.previous_day.energy_kwh.toFixed(3)} kWh ${trend} ${diff > 0 ? '+' : ''}${diff.toFixed(3)} kWh`);
      } else {
        console.log('📅 Vorheriger Tag: Keine Daten verfügbar');
      }
      
      // Wochendurchschnitt
      if (comp.week_average && comp.week_average.days_count > 0) {
        const diff = report.total_energy_kwh - comp.week_average.avg_energy_kwh;
        const trend = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
        console.log(`📊 Wochendurchschnitt (${comp.week_average.days_count} Tage): ${comp.week_average.avg_energy_kwh.toFixed(3)} kWh ${trend} ${diff > 0 ? '+' : ''}${diff.toFixed(3)} kWh`);
      } else {
        console.log('📊 Wochendurchschnitt: Keine Daten verfügbar');
      }
    }
    
    console.log('='.repeat(70));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const dateArg = args.find(arg => arg.startsWith('--date='));
  const jsonOutput = args.includes('--json');
  
  let date = new Date();
  if (dateArg) {
    const dateStr = dateArg.split('=')[1];
    date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('❌ Ungültiges Datum. Verwende YYYY-MM-DD Format');
      process.exit(1);
    }
  }
  
  const generator = new DailyReportGenerator();
  const report = await generator.generateDailyReport(date);
  
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    generator.printReport(report);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DailyReportGenerator;

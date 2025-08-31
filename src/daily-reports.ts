// Daily Solar Reports Feature with Multi-Language Support
// src/daily-reports.ts

import { Logger, PlatformAccessory } from 'homebridge';
import { SolarReportI18n, DailyReportData } from './i18n';

export interface DailyReportConfig {
  enabled: boolean;
  language: string;
  reportTime: 'sunset' | 'sunset+30' | 'sunset+60' | string;
  reportStyle: 'motion' | 'doorbell' | 'switch';
  includeComparisons: boolean;
  customMessages: boolean;
  timeZone?: string;
}

export interface DailyStats {
  date: string;
  energyWh: number;
  peakPowerW: number;
  peakTime: Date;
  firstProduction: Date | null;
  lastProduction: Date | null;
  totalProductionMinutes: number;
  samples: Array<{ time: Date; power: number }>;
}

export class DailyReportsManager {
  private i18n: SolarReportI18n;
  private dailyStats: Map<string, DailyStats> = new Map();
  private reportSentToday: boolean = false;
  private config: DailyReportConfig;
  private log: Logger;
  private reportAccessory: PlatformAccessory | null = null;
  private Service: any;
  private Characteristic: any;
  
  constructor(config: DailyReportConfig, log: Logger, Service: any, Characteristic: any) {
    this.config = config;
    this.log = log;
    this.Service = Service;
    this.Characteristic = Characteristic;
    this.i18n = new SolarReportI18n();
    this.i18n.setLocale(config.language || 'en');
    
    this.log.info(`Daily reports initialized in ${config.language || 'en'} language`);
  }
  
  setReportAccessory(accessory: PlatformAccessory): void {
    this.reportAccessory = accessory;
  }
  
  updatePowerData(powerW: number, timestamp: Date = new Date()): void {
    const dateKey = this.getDateKey(timestamp);
    let stats = this.dailyStats.get(dateKey);
    
    if (!stats) {
      stats = this.createNewDayStats(dateKey, timestamp);
      this.dailyStats.set(dateKey, stats);
      this.reportSentToday = false; // Reset for new day
    }
    
    // Update daily statistics
    this.updateDailyStats(stats, powerW, timestamp);
    
    // Check if we should send daily report
    this.checkForDailyReport(timestamp);
  }
  
  private createNewDayStats(dateKey: string, timestamp: Date): DailyStats {
    return {
      date: dateKey,
      energyWh: 0,
      peakPowerW: 0,
      peakTime: timestamp,
      firstProduction: null,
      lastProduction: null,
      totalProductionMinutes: 0,
      samples: []
    };
  }
  
  private updateDailyStats(stats: DailyStats, powerW: number, timestamp: Date): void {
    // Track energy (simple integration)
    if (stats.samples.length > 0) {
      const lastSample = stats.samples[stats.samples.length - 1];
      const minutesDiff = (timestamp.getTime() - lastSample.time.getTime()) / (1000 * 60);
      if (minutesDiff > 0 && minutesDiff < 60) { // Reasonable time diff
        const avgPower = (powerW + lastSample.power) / 2;
        stats.energyWh += (avgPower * minutesDiff) / 60; // Convert to Wh
      }
    }
    
    // Track peak power
    if (powerW > stats.peakPowerW) {
      stats.peakPowerW = powerW;
      stats.peakTime = timestamp;
    }
    
    // Track production period
    if (powerW > 0) {
      if (!stats.firstProduction) {
        stats.firstProduction = timestamp;
      }
      stats.lastProduction = timestamp;
    }
    
    // Add sample
    stats.samples.push({ time: timestamp, power: powerW });
    
    // Keep only last 24 hours of samples
    const oneDayAgo = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
    stats.samples = stats.samples.filter(sample => sample.time > oneDayAgo);
    
    // Calculate production minutes
    if (stats.firstProduction && stats.lastProduction) {
      stats.totalProductionMinutes = (stats.lastProduction.getTime() - stats.firstProduction.getTime()) / (1000 * 60);
    }
  }
  
  private checkForDailyReport(timestamp: Date): void {
    if (!this.config.enabled || this.reportSentToday) {
      return;
    }
    
    const shouldSendReport = this.shouldSendReport(timestamp);
    if (shouldSendReport) {
      this.sendDailyReport(timestamp);
      this.reportSentToday = true;
    }
  }
  
  private shouldSendReport(timestamp: Date): boolean {
    const now = timestamp;
    const reportTime = this.calculateReportTime(now);
    
    // Check if current time is past report time
    if (now >= reportTime) {
      // Also check if we haven't had production for a while (system went offline)
      const currentStats = this.dailyStats.get(this.getDateKey(now));
      if (currentStats && currentStats.lastProduction) {
        const minutesSinceLastProduction = (now.getTime() - currentStats.lastProduction.getTime()) / (1000 * 60);
        return minutesSinceLastProduction >= 30; // 30 minutes of no production
      }
    }
    
    return false;
  }
  
  private calculateReportTime(date: Date): Date {
    // Simplified sunset calculation (would use proper astronomical calculation in production)
    const reportTime = new Date(date);
    let baseHour: number;
    let baseMinute: number;
    
    switch (this.config.reportTime) {
      case 'sunset':
        baseHour = 19;
        baseMinute = 0;
        break;
      case 'sunset+30':
        baseHour = 19;
        baseMinute = 30;
        break;
      case 'sunset+60':
        baseHour = 20;
        baseMinute = 0;
        break;
      default: {
        // Parse custom time (e.g., "20:30")
        const timeParts = this.config.reportTime.split(':');
        if (timeParts.length === 2) {
          baseHour = parseInt(timeParts[0]);
          baseMinute = parseInt(timeParts[1]);
        } else {
          baseHour = 19;
          baseMinute = 30; // Default fallback
        }
        break;
      }
    }
    
    reportTime.setHours(baseHour, baseMinute, 0, 0);
    return reportTime;
  }
  
  private sendDailyReport(timestamp: Date): void {
    const dateKey = this.getDateKey(timestamp);
    const todayStats = this.dailyStats.get(dateKey);
    
    if (!todayStats) {
      this.log.warn('No stats available for daily report');
      return;
    }
    
    // Generate report data
    const reportData = this.generateReportData(todayStats, timestamp);
    
    // Generate localized message
    const message = this.i18n.generateDailyReport(reportData);
    
    // Send report based on configured style
    this.deliverReport(message);
    
    this.log.info(`Daily solar report sent: ${reportData.energyKwh.toFixed(1)} kWh generated`);
  }
  
  private generateReportData(stats: DailyStats, timestamp: Date): DailyReportData {
    const yesterdayStats = this.getYesterdayStats(timestamp);
    const comparison = this.calculateComparison(stats, yesterdayStats);
    
    return {
      energyKwh: stats.energyWh / 1000, // Convert Wh to kWh
      efficiencyPercent: this.calculateEfficiency(stats),
      peakPowerKw: stats.peakPowerW / 1000, // Convert W to kW
      peakTime: stats.peakTime,
      productionHours: stats.totalProductionMinutes / 60,
      comparison: comparison,
      weather: this.detectWeather(stats)
    };
  }
  
  private calculateComparison(todayStats: DailyStats, yesterdayStats: DailyStats | null): { percent: number; type: 'yesterday' | 'average' } {
    if (yesterdayStats && yesterdayStats.energyWh > 0) {
      const percentChange = ((todayStats.energyWh - yesterdayStats.energyWh) / yesterdayStats.energyWh) * 100;
      return { percent: percentChange, type: 'yesterday' };
    }
    
    // Fallback to average comparison (simplified)
    const weeklyAverage = this.calculateWeeklyAverage();
    if (weeklyAverage > 0) {
      const percentChange = ((todayStats.energyWh - weeklyAverage) / weeklyAverage) * 100;
      return { percent: percentChange, type: 'average' };
    }
    
    return { percent: 0, type: 'yesterday' };
  }
  
  private calculateEfficiency(stats: DailyStats): number {
    // Simplified efficiency calculation (would be more sophisticated in production)
    const estimatedCapacity = 10; // kWh per day (configurable)
    return Math.min(100, (stats.energyWh / 1000 / estimatedCapacity) * 100);
  }
  
  private detectWeather(stats: DailyStats): 'sunny' | 'partlyCloudy' | 'cloudy' | 'mixed' {
    // Analyze power curve to detect weather conditions
    if (stats.samples.length < 10) return 'mixed';
    
    const maxPower = Math.max(...stats.samples.map(s => s.power));
    const avgPower = stats.samples.reduce((sum, s) => sum + s.power, 0) / stats.samples.length;
    const variability = this.calculateVariability(stats.samples);
    
    if (maxPower > 2000 && avgPower > 800 && variability < 0.3) {
      return 'sunny';
    } else if (maxPower > 1000 && variability < 0.5) {
      return 'partlyCloudy';
    } else if (maxPower < 500) {
      return 'cloudy';
    } else {
      return 'mixed';
    }
  }
  
  private calculateVariability(samples: Array<{ time: Date; power: number }>): number {
    if (samples.length < 2) return 0;
    
    const powers = samples.map(s => s.power);
    const mean = powers.reduce((sum, p) => sum + p, 0) / powers.length;
    const variance = powers.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / powers.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? stdDev / mean : 0; // Coefficient of variation
  }
  
  private deliverReport(message: string): void {
    if (!this.reportAccessory) {
      this.log.warn('No report accessory configured');
      return;
    }
    
    switch (this.config.reportStyle) {
      case 'motion':
        this.triggerMotionSensor(message);
        break;
      case 'doorbell':
        this.triggerDoorbell(message);
        break;
      case 'switch':
        this.triggerSwitch(message);
        break;
    }
  }
  
  private triggerMotionSensor(message: string): void {
    const service = this.reportAccessory?.getService(this.Service.MotionSensor);
    if (service) {
      // Trigger motion detection to send notification
      service.updateCharacteristic(this.Characteristic.MotionDetected, true);
      
      // Reset after a short delay
      setTimeout(() => {
        service.updateCharacteristic(this.Characteristic.MotionDetected, false);
      }, 5000);
      
      this.log.info(`Motion sensor triggered for daily report: ${message}`);
    }
  }
  
  private triggerDoorbell(message: string): void {
    // Implementation for doorbell service
    this.log.info(`Doorbell triggered for daily report: ${message}`);
  }
  
  private triggerSwitch(message: string): void {
    // Implementation for programmable switch
    this.log.info(`Switch triggered for daily report: ${message}`);
  }
  
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  private getYesterdayStats(today: Date): DailyStats | null {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.dailyStats.get(this.getDateKey(yesterday)) || null;
  }
  
  private calculateWeeklyAverage(): number {
    // Calculate average from last 7 days
    const now = new Date();
    let totalEnergy = 0;
    let validDays = 0;
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const stats = this.dailyStats.get(this.getDateKey(date));
      if (stats && stats.energyWh > 0) {
        totalEnergy += stats.energyWh;
        validDays++;
      }
    }
    
    return validDays > 0 ? totalEnergy / validDays : 0;
  }
  
  // Public method to manually trigger report (for testing)
  public triggerManualReport(): void {
    const now = new Date();
    this.reportSentToday = false; // Allow manual trigger
    this.sendDailyReport(now);
  }
  
  // Get today's statistics for display
  public getTodayStats(): DailyStats | null {
    const today = new Date();
    return this.dailyStats.get(this.getDateKey(today)) || null;
  }
}
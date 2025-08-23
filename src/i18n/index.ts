// Internationalization system for daily solar reports
// src/i18n/index.ts

export interface SolarReportTranslations {
  // Basic metrics
  energyGenerated: string;
  peakPower: string;
  productionHours: string;
  efficiency: string;
  
  // Report messages
  dailySummaryTitle: string;
  productionComplete: string;
  excellentDay: string;
  goodDay: string;
  averageDay: string;
  poorDay: string;
  noProduction: string;
  
  // Comparisons
  vsYesterday: string;
  aboveAverage: string;
  belowAverage: string;
  newRecord: string;
  
  // Weather descriptions
  sunny: string;
  partlyCloudy: string;
  cloudy: string;
  mixed: string;
  
  // Time expressions
  peakAt: string;
  hoursOfSun: string;
  
  // Units (localized)
  kwh: string;
  kw: string;
  hours: string;
  percent: string;
  
  // Template messages
  templates: {
    dailyComplete: string;
    summary: string;
    comparison: string;
    weather: string;
  };
}

export class SolarReportI18n {
  private translations: Map<string, SolarReportTranslations> = new Map();
  private currentLocale: string = 'en';
  
  constructor() {
    this.loadTranslations();
  }
  
  setLocale(locale: string): void {
    if (this.translations.has(locale)) {
      this.currentLocale = locale;
    } else {
      console.warn(`Locale ${locale} not supported, falling back to English`);
      this.currentLocale = 'en';
    }
  }
  
  t(key: string): string {
    const translation = this.translations.get(this.currentLocale);
    if (!translation) {
      return this.translations.get('en')?.[key as keyof SolarReportTranslations] as string || key;
    }
    
    return this.getNestedValue(translation, key) || key;
  }
  
  private getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  formatNumber(value: number, decimals: number = 1): string {
    // Use locale-specific number formatting
    return new Intl.NumberFormat(this.currentLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }
  
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  generateDailyReport(data: DailyReportData): string {
    const template = this.t('templates.dailyComplete');
    return this.interpolate(template, {
      energy: this.formatNumber(data.energyKwh, 1),
      energyUnit: this.t('kwh'),
      efficiency: this.formatNumber(data.efficiencyPercent, 0),
      percent: this.t('percent'),
      peak: this.formatNumber(data.peakPowerKw, 1),
      peakUnit: this.t('kw'),
      peakTime: this.formatTime(data.peakTime),
      comparison: this.formatComparison(data.comparison)
    });
  }
  
  private interpolate(template: string, values: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] || match);
  }
  
  private formatComparison(comparison: { percent: number; type: 'yesterday' | 'average' }): string {
    const sign = comparison.percent >= 0 ? '+' : '';
    const percent = this.formatNumber(Math.abs(comparison.percent), 0);
    const baseKey = comparison.type === 'yesterday' ? 'vsYesterday' : 
                   comparison.percent > 0 ? 'aboveAverage' : 'belowAverage';
    
    return this.interpolate(this.t(baseKey), { 
      sign, 
      percent,
      percentUnit: this.t('percent')
    });
  }
  
  private loadTranslations(): void {
    // Load all language files
    this.translations.set('en', require('./locales/en.json'));
    this.translations.set('de', require('./locales/de.json'));
    this.translations.set('fr', require('./locales/fr.json'));
    this.translations.set('it', require('./locales/it.json'));
    this.translations.set('zh', require('./locales/zh.json'));
  }
}

export interface DailyReportData {
  energyKwh: number;
  efficiencyPercent: number;
  peakPowerKw: number;
  peakTime: Date;
  productionHours: number;
  comparison: {
    percent: number;
    type: 'yesterday' | 'average';
  };
  weather: 'sunny' | 'partlyCloudy' | 'cloudy' | 'mixed';
}
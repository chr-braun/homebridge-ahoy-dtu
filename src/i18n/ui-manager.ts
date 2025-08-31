import * as path from 'path';
import * as fs from 'fs';

export interface UILocale {
  platform: {
    name: string;
    description: string;
  };
  config: {
    basic: {
      title: string;
      description: string;
      name: string;
      nameDescription: string;
    };
    mqtt: {
      title: string;
      description: string;
      host: string;
      hostDescription: string;
      port: string;
      portDescription: string;
      username: string;
      usernameDescription: string;
      password: string;
      passwordDescription: string;
    };
    devices: {
      title: string;
      description: string;
      discoverDevices: string;
      discoverDevicesDescription: string;
      usePreset: string;
      usePresetDescription: string;
      presetOptions: {
        basic: string;
        detailed: string;
        individual: string;
      };
      selectedDevices: string;
      selectedDevicesDescription: string;
    };
    power: {
      title: string;
      description: string;
      usePowerOutlets: string;
      usePowerOutletsDescription: string;
      maxEnergyPerDay: string;
      maxEnergyPerDayDescription: string;
    };
    monitoring: {
      title: string;
      description: string;
      offlineThresholdMinutes: string;
      offlineThresholdMinutesDescription: string;
    };
    reports: {
      title: string;
      description: string;
      enabled: string;
      enabledDescription: string;
      language: string;
      languageDescription: string;
      languageOptions: {
        de: string;
        en: string;
        fr: string;
      };
      reportStyle: string;
      reportStyleDescription: string;
      reportStyleOptions: {
        motion: string;
        doorbell: string;
        switch: string;
      };
      reportTime: string;
      reportTimeDescription: string;
      reportTimeOptions: {
        sunset: string;
        'sunset+30': string;
        'sunset+60': string;
        '20:00': string;
        '21:00': string;
        '22:00': string;
      };
      includeComparisons: string;
      includeComparisonsDescription: string;
    };
  };
  messages: {
    success: string;
    error: string;
    warning: string;
    info: string;
    loading: string;
    saving: string;
    testing: string;
    connected: string;
    disconnected: string;
    online: string;
    offline: string;
  };
  actions: {
    save: string;
    cancel: string;
    test: string;
    discover: string;
    refresh: string;
    restart: string;
    remove: string;
    add: string;
  };
}

export class UILocalizationManager {
  private locales: Map<string, UILocale> = new Map();
  private defaultLocale: string = 'en';
  private currentLocale: string = 'en';

  constructor() {
    this.loadLocales();
  }

  /**
   * Load all available UI locales
   */
  private loadLocales(): void {
    const localesPath = path.join(__dirname, 'ui-locales');
    
    try {
      const localeFiles = fs.readdirSync(localesPath);
      
      for (const file of localeFiles) {
        if (file.endsWith('.json')) {
          const localeCode = file.replace('.json', '');
          const localePath = path.join(localesPath, file);
          const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
          
          this.locales.set(localeCode, localeData);
          console.log(`Loaded UI locale: ${localeCode}`);
        }
      }
    } catch (error) {
      console.warn('Could not load UI locales:', error);
    }
  }

  /**
   * Set the current UI locale
   */
  setLocale(locale: string): void {
    if (this.locales.has(locale)) {
      this.currentLocale = locale;
    } else {
      console.warn(`UI locale '${locale}' not found, using default: ${this.defaultLocale}`);
      this.currentLocale = this.defaultLocale;
    }
  }

  /**
   * Get the current UI locale
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get available UI locales
   */
  getAvailableLocales(): string[] {
    return Array.from(this.locales.keys());
  }

  /**
   * Get a localized string from the current locale
   */
  get(key: string, defaultValue?: string): string {
    const locale = this.locales.get(this.currentLocale) || this.locales.get(this.defaultLocale);
    
    if (!locale) {
      return defaultValue || key;
    }

    const keys = key.split('.');
    let value: any = locale;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : (defaultValue || key);
  }

  /**
   * Get a localized string from a specific locale
   */
  getFromLocale(locale: string, key: string, defaultValue?: string): string {
    const targetLocale = this.locales.get(locale) || this.locales.get(this.defaultLocale);
    
    if (!targetLocale) {
      return defaultValue || key;
    }

    const keys = key.split('.');
    let value: any = targetLocale;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : (defaultValue || key);
  }

  /**
   * Get localized configuration schema
   */
  getLocalizedConfigSchema(): any {
    const locale = this.locales.get(this.currentLocale) || this.locales.get(this.defaultLocale);
    
    if (!locale) {
      return {};
    }

    return {
      name: {
        title: locale.config.basic.name,
        description: locale.config.basic.nameDescription,
        type: 'string',
        required: true
      },
      mqttHost: {
        title: locale.config.mqtt.host,
        description: locale.config.mqtt.hostDescription,
        type: 'string',
        required: true
      },
      mqttPort: {
        title: locale.config.mqtt.port,
        description: locale.config.mqtt.portDescription,
        type: 'number',
        default: 1883,
        minimum: 1,
        maximum: 65535
      },
      mqttUsername: {
        title: locale.config.mqtt.username,
        description: locale.config.mqtt.usernameDescription,
        type: 'string'
      },
      mqttPassword: {
        title: locale.config.mqtt.password,
        description: locale.config.mqtt.passwordDescription,
        type: 'string'
      },
      discoverDevices: {
        title: locale.config.devices.discoverDevices,
        description: locale.config.devices.discoverDevicesDescription,
        type: 'boolean',
        default: false
      },
      usePreset: {
        title: locale.config.devices.usePreset,
        description: locale.config.devices.usePresetDescription,
        type: 'string',
        enum: ['basic', 'detailed', 'individual-inverters'],
        enumNames: [
          locale.config.devices.presetOptions.basic,
          locale.config.devices.presetOptions.detailed,
          locale.config.devices.presetOptions.individual
        ]
      },
      selectedDevices: {
        title: locale.config.devices.selectedDevices,
        description: locale.config.devices.selectedDevicesDescription,
        type: 'array',
        items: {
          type: 'string'
        }
      },
      usePowerOutlets: {
        title: locale.config.power.usePowerOutlets,
        description: locale.config.power.usePowerOutletsDescription,
        type: 'boolean',
        default: false
      },
      maxEnergyPerDay: {
        title: locale.config.power.maxEnergyPerDay,
        description: locale.config.power.maxEnergyPerDayDescription,
        type: 'number',
        default: 10,
        minimum: 0.1,
        maximum: 100
      },
      offlineThresholdMinutes: {
        title: locale.config.monitoring.offlineThresholdMinutes,
        description: locale.config.monitoring.offlineThresholdMinutesDescription,
        type: 'number',
        default: 15,
        minimum: 5,
        maximum: 120
      },
      dailyReports: {
        title: locale.config.reports.title,
        description: locale.config.reports.description,
        type: 'object',
        properties: {
          enabled: {
            title: locale.config.reports.enabled,
            description: locale.config.reports.enabledDescription,
            type: 'boolean',
            default: false
          },
          language: {
            title: locale.config.reports.language,
            description: locale.config.reports.languageDescription,
            type: 'string',
            enum: ['de', 'en', 'fr'],
            enumNames: [
              locale.config.reports.languageOptions.de,
              locale.config.reports.languageOptions.en,
              locale.config.reports.languageOptions.fr
            ],
            default: 'en'
          },
          reportStyle: {
            title: locale.config.reports.reportStyle,
            description: locale.config.reports.reportStyleDescription,
            type: 'string',
            enum: ['motion', 'doorbell', 'switch'],
            enumNames: [
              locale.config.reports.reportStyleOptions.motion,
              locale.config.reports.reportStyleOptions.doorbell,
              locale.config.reports.reportStyleOptions.switch
            ],
            default: 'motion'
          },
          reportTime: {
            title: locale.config.reports.reportTime,
            description: locale.config.reports.reportTimeDescription,
            type: 'string',
            enum: ['sunset', 'sunset+30', 'sunset+60', '20:00', '21:00', '22:00'],
            enumNames: [
              locale.config.reports.reportTimeOptions.sunset,
              locale.config.reports.reportTimeOptions['sunset+30'],
              locale.config.reports.reportTimeOptions['sunset+60'],
              locale.config.reports.reportTimeOptions['20:00'],
              locale.config.reports.reportTimeOptions['21:00'],
              locale.config.reports.reportTimeOptions['22:00']
            ],
            default: 'sunset+30'
          },
          includeComparisons: {
            title: locale.config.reports.includeComparisons,
            description: locale.config.reports.includeComparisonsDescription,
            type: 'boolean',
            default: true
          }
        }
      }
    };
  }
}

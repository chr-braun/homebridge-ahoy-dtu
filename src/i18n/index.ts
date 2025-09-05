import * as fs from 'fs';
import * as path from 'path';

export class I18nManager {
  private translations: { [key: string]: any } = {};
  private defaultLanguage = 'en';

  constructor(private language: string = 'en') {
    this.loadTranslations();
  }

  private loadTranslations() {
    try {
      const localesPath = path.join(__dirname, 'locales');
      const files = fs.readdirSync(localesPath);
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const lang = file.replace('.json', '');
          const filePath = path.join(localesPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          this.translations[lang] = JSON.parse(content);
        }
      });
    } catch (error) {
      console.error('Fehler beim Laden der Übersetzungen:', error);
    }
  }

  public t(key: string, fallback: string): string {
    try {
      const keys = key.split('.');
      let value = this.translations[this.language];
      
      if (!value) {
        value = this.translations[this.defaultLanguage];
      }
      
      if (!value) {
        return fallback;
      }

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return fallback;
        }
      }

      return typeof value === 'string' ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  public setLanguage(language: string) {
    this.language = language;
  }

  public getLanguage(): string {
    return this.language;
  }

  public getSupportedLanguages(): string[] {
    return Object.keys(this.translations);
  }
}
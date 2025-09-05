import { Logger } from 'homebridge';

export interface DataPoint {
  timestamp: number;
  value: number;
  type: string;
}

export interface StorageConfig {
  enabled: boolean;
  retentionHours: number;
  samplingInterval: number; // in minutes
  compressionEnabled: boolean;
}

export class DataStorageManager {
  private data: Map<string, DataPoint[]> = new Map();
  private lastSampleTime: Map<string, number> = new Map();
  private config: StorageConfig;
  private log: Logger;

  constructor(config: StorageConfig, log: Logger) {
    this.config = config;
    this.log = log;
    
    if (config.enabled) {
      this.log.info(`📊 Historical Data Storage aktiviert - Retention: ${config.retentionHours}h, Sampling: ${config.samplingInterval}min`);
    }
  }

  /**
   * Speichert einen Datenpunkt nur wenn Sampling-Intervall erreicht ist
   */
  public storeData(sensorType: string, value: number): void {
    if (!this.config.enabled) {
      return;
    }

    const now = Date.now();
    const lastSample = this.lastSampleTime.get(sensorType) || 0;
    const samplingIntervalMs = this.config.samplingInterval * 60 * 1000;

    // Nur speichern wenn Sampling-Intervall erreicht
    if (now - lastSample < samplingIntervalMs) {
      return;
    }

    const dataPoint: DataPoint = {
      timestamp: now,
      value: value,
      type: sensorType
    };

    if (!this.data.has(sensorType)) {
      this.data.set(sensorType, []);
    }

    const sensorData = this.data.get(sensorType)!;
    sensorData.push(dataPoint);

    // Rolling Window - alte Daten entfernen
    this.cleanupOldData(sensorType);

    this.lastSampleTime.set(sensorType, now);

    // Komprimierung bei Bedarf
    if (this.config.compressionEnabled) {
      this.compressData(sensorType);
    }

    this.log.debug(`📊 Daten gespeichert: ${sensorType} = ${value} (${sensorData.length} Punkte)`);
  }

  /**
   * Entfernt alte Daten basierend auf Retention-Zeit
   */
  private cleanupOldData(sensorType: string): void {
    const sensorData = this.data.get(sensorType);
    if (!sensorData) return;

    const retentionMs = this.config.retentionHours * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionMs;

    // Entferne Daten älter als Retention-Zeit
    const filteredData = sensorData.filter(point => point.timestamp > cutoffTime);
    this.data.set(sensorType, filteredData);
  }

  /**
   * Komprimiert Daten durch Entfernen von ähnlichen Werten
   */
  private compressData(sensorType: string): void {
    const sensorData = this.data.get(sensorType);
    if (!sensorData || sensorData.length < 10) return;

    const compressed: DataPoint[] = [];
    const threshold = 0.01; // 1% Änderung für Komprimierung

    for (let i = 0; i < sensorData.length; i++) {
      const current = sensorData[i];
      const previous = compressed[compressed.length - 1];

      // Ersten Punkt immer behalten
      if (!previous) {
        compressed.push(current);
        continue;
      }

      // Berechne relative Änderung
      const change = Math.abs(current.value - previous.value) / Math.abs(previous.value);
      
      // Nur speichern wenn signifikante Änderung
      if (change > threshold || i === sensorData.length - 1) {
        compressed.push(current);
      }
    }

    this.data.set(sensorType, compressed);
    this.log.debug(`📊 Daten komprimiert: ${sensorType} ${sensorData.length} → ${compressed.length} Punkte`);
  }

  /**
   * Gibt historische Daten für einen Sensor zurück
   */
  public getHistoricalData(sensorType: string, hours: number = 24): DataPoint[] {
    const sensorData = this.data.get(sensorType) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    return sensorData.filter(point => point.timestamp > cutoffTime);
  }

  /**
   * Gibt Statistiken für einen Sensor zurück
   */
  public getStatistics(sensorType: string, hours: number = 24): {
    count: number;
    min: number;
    max: number;
    avg: number;
    latest: number;
  } | null {
    const data = this.getHistoricalData(sensorType, hours);
    if (data.length === 0) return null;

    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];

    return {
      count: data.length,
      min,
      max,
      avg: Math.round(avg * 100) / 100,
      latest
    };
  }

  /**
   * Gibt alle verfügbaren Sensoren zurück
   */
  public getAvailableSensors(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Gibt Speicher-Statistiken zurück
   */
  public getStorageStats(): {
    totalSensors: number;
    totalDataPoints: number;
    memoryUsage: string;
  } {
    const totalSensors = this.data.size;
    const totalDataPoints = Array.from(this.data.values())
      .reduce((sum, sensorData) => sum + sensorData.length, 0);
    
    // Grobe Schätzung der Speichernutzung
    const estimatedBytes = totalDataPoints * 32; // ~32 bytes pro DataPoint
    const memoryUsage = this.formatBytes(estimatedBytes);

    return {
      totalSensors,
      totalDataPoints,
      memoryUsage
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Löscht alle Daten (für Tests)
   */
  public clearAllData(): void {
    this.data.clear();
    this.lastSampleTime.clear();
    this.log.info('📊 Alle historischen Daten gelöscht');
  }
}

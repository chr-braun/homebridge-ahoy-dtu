import express, { Request, Response } from 'express';
import cors from 'cors';
import { Logger } from 'homebridge';
import { DataStorageManager } from './data-storage-manager';

export interface WebInterfaceConfig {
  enabled: boolean;
  port: number;
  refreshInterval: number; // in seconds
}

export class WebInterface {
  private app: express.Application;
  private server: any = null;
  private config: WebInterfaceConfig;
  private log: Logger;
  private dataStorage: DataStorageManager | null = null;

  constructor(config: WebInterfaceConfig, log: Logger) {
    this.config = config;
    this.log = log;
    this.app = express();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Middleware einrichten
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  /**
   * Routes einrichten
   */
  private setupRoutes(): void {
    // Dashboard HTML
    this.app.get('/', (req: Request, res: Response) => {
      res.send(this.getDashboardHTML());
    });

    // API: Alle Sensoren
    this.app.get('/api/sensors', (req: Request, res: Response) => {
      if (!this.dataStorage) {
        return res.status(503).json({ error: 'Data storage not available' });
      }
      
      const sensors = this.dataStorage.getAvailableSensors();
      res.json({ sensors });
    });

    // API: Historische Daten für einen Sensor
    this.app.get('/api/sensor/:sensorType/data', (req: Request, res: Response) => {
      if (!this.dataStorage) {
        return res.status(503).json({ error: 'Data storage not available' });
      }

      const { sensorType } = req.params;
      const hours = parseInt(req.query.hours as string) || 24;
      
      const data = this.dataStorage.getHistoricalData(sensorType, hours);
      res.json({ 
        sensorType, 
        hours, 
        dataPoints: data.length,
        data 
      });
    });

    // API: Statistiken für einen Sensor
    this.app.get('/api/sensor/:sensorType/stats', (req: Request, res: Response) => {
      if (!this.dataStorage) {
        return res.status(503).json({ error: 'Data storage not available' });
      }

      const { sensorType } = req.params;
      const hours = parseInt(req.query.hours as string) || 24;
      
      const stats = this.dataStorage.getStatistics(sensorType, hours);
      if (!stats) {
        return res.status(404).json({ error: 'No data available for sensor' });
      }

      res.json({ 
        sensorType, 
        hours, 
        ...stats 
      });
    });

    // API: Speicher-Statistiken
    this.app.get('/api/storage/stats', (req: Request, res: Response) => {
      if (!this.dataStorage) {
        return res.status(503).json({ error: 'Data storage not available' });
      }

      const stats = this.dataStorage.getStorageStats();
      res.json(stats);
    });

    // API: Alle Sensoren mit Statistiken
    this.app.get('/api/sensors/overview', (req: Request, res: Response) => {
      if (!this.dataStorage) {
        return res.status(503).json({ error: 'Data storage not available' });
      }

      const sensors = this.dataStorage.getAvailableSensors();
      const overview = sensors.map(sensorType => {
        const stats = this.dataStorage!.getStatistics(sensorType, 24);
        return {
          sensorType,
          ...stats
        };
      }).filter(sensor => sensor.count && sensor.count > 0);

      res.json({ sensors: overview });
    });
  }

  /**
   * DataStorageManager setzen
   */
  public setDataStorage(dataStorage: DataStorageManager): void {
    this.dataStorage = dataStorage;
  }

  /**
   * Web Server starten
   */
  public start(): void {
    if (!this.config.enabled) {
      this.log.info('🌐 Web Interface deaktiviert');
      return;
    }

    try {
      this.server = this.app.listen(this.config.port, () => {
        this.log.info(`🌐 Web Interface gestartet: http://localhost:${this.config.port}`);
        this.log.info(`📊 Dashboard verfügbar: http://localhost:${this.config.port}/`);
      });
    } catch (error) {
      this.log.error('❌ Fehler beim Starten des Web Interface:', error);
    }
  }

  /**
   * Web Server stoppen
   */
  public stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.log.info('🌐 Web Interface gestoppt');
    }
  }

  /**
   * Dashboard HTML generieren
   */
  private getDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AHOY-DTU Solar Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f7;
            color: #1d1d1f;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 1.1rem;
            color: #86868b;
            font-weight: 400;
        }
        
        .status-bar {
            background: #ffffff;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
            border: 1px solid #e5e5e7;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #30d158;
        }
        
        .status-dot.warning {
            background: #ff9f0a;
        }
        
        .status-dot.error {
            background: #ff3b30;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        
        .stat-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e5e5e7;
            transition: all 0.2s ease;
        }
        
        .stat-card:hover {
            border-color: #007aff;
            box-shadow: 0 4px 20px rgba(0, 122, 255, 0.1);
        }
        
        .stat-card h3 {
            color: #1d1d1f;
            margin-bottom: 12px;
            font-size: 1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #007aff;
            margin-bottom: 8px;
            line-height: 1;
        }
        
        .stat-label {
            color: #86868b;
            font-size: 0.9rem;
            font-weight: 400;
        }
        
        .stat-details {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #f2f2f7;
            font-size: 0.8rem;
            color: #86868b;
        }
        
        .chart-container {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e5e5e7;
            margin-bottom: 24px;
        }
        
        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .chart-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1d1d1f;
        }
        
        .controls {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .sensor-selector select {
            padding: 8px 12px;
            border: 1px solid #d2d2d7;
            border-radius: 8px;
            font-size: 0.9rem;
            background: #ffffff;
            color: #1d1d1f;
            min-width: 200px;
        }
        
        .sensor-selector select:focus {
            outline: none;
            border-color: #007aff;
        }
        
        .time-selector {
            display: flex;
            gap: 4px;
        }
        
        .time-btn {
            padding: 6px 12px;
            border: 1px solid #d2d2d7;
            background: #ffffff;
            color: #1d1d1f;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .time-btn.active {
            background: #007aff;
            color: #ffffff;
            border-color: #007aff;
        }
        
        .time-btn:hover:not(.active) {
            background: #f2f2f7;
        }
        
        .loading {
            text-align: center;
            color: #86868b;
            padding: 60px 20px;
            font-size: 1.1rem;
        }
        
        .error {
            background: #ffebee;
            color: #d32f2f;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            border: 1px solid #ffcdd2;
        }
        
        .no-data {
            text-align: center;
            color: #86868b;
            padding: 40px;
            font-size: 1rem;
        }
        
        .refresh-info {
            text-align: center;
            color: #86868b;
            font-size: 0.9rem;
            margin-top: 24px;
        }
        
        .chart-placeholder {
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #86868b;
            font-size: 1rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 16px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .chart-header {
                flex-direction: column;
                gap: 16px;
                align-items: stretch;
            }
            
            .controls {
                flex-direction: column;
            }
            
            .sensor-selector select {
                min-width: auto;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Solar Dashboard</h1>
            <p>Echtzeit-Monitoring Ihrer AHOY-DTU Solaranlage</p>
        </div>
        
        <div class="status-bar">
            <div class="status-item">
                <div class="status-dot" id="mqtt-status"></div>
                <span>MQTT Verbindung</span>
            </div>
            <div class="status-item">
                <div class="status-dot" id="data-status"></div>
                <span>Datenverfügbarkeit</span>
            </div>
            <div class="status-item">
                <span id="last-update">Letzte Aktualisierung: --</span>
            </div>
        </div>
        
        <div id="error-container"></div>
        
        <div class="stats-grid" id="stats-grid">
            <div class="loading">Lade Sensordaten...</div>
        </div>
        
        <div class="chart-container">
            <div class="chart-header">
                <div class="chart-title">Historische Daten</div>
                <div class="controls">
                    <div class="sensor-selector">
                        <select id="sensor-select">
                            <option value="">Sensor auswählen...</option>
                        </select>
                    </div>
                    <div class="time-selector">
                        <button class="time-btn active" data-hours="1">1h</button>
                        <button class="time-btn" data-hours="6">6h</button>
                        <button class="time-btn" data-hours="24">24h</button>
                        <button class="time-btn" data-hours="168">7d</button>
                    </div>
                </div>
            </div>
            <div id="chart-container">
                <canvas id="data-chart" width="400" height="200"></canvas>
            </div>
        </div>
        
        <div class="refresh-info">
            Automatische Aktualisierung alle ${this.config.refreshInterval} Sekunden
        </div>
    </div>

    <script>
        let chart = null;
        let refreshInterval = null;
        let currentSensor = '';
        let currentHours = 24;

        // Initialisierung
        document.addEventListener('DOMContentLoaded', function() {
            loadSensors();
            loadStats();
            setupEventListeners();
            startAutoRefresh();
        });

        // Event Listeners
        function setupEventListeners() {
            document.getElementById('sensor-select').addEventListener('change', function() {
                currentSensor = this.value;
                if (currentSensor) {
                    loadChartData();
                }
            });

            document.querySelectorAll('.time-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentHours = parseInt(this.dataset.hours);
                    if (currentSensor) {
                        loadChartData();
                    }
                });
            });
        }

        // Sensoren laden
        async function loadSensors() {
            try {
                const response = await fetch('/api/sensors');
                const data = await response.json();
                
                const select = document.getElementById('sensor-select');
                select.innerHTML = '<option value="">Sensor auswählen...</option>';
                
                if (data.sensors && data.sensors.length > 0) {
                    data.sensors.forEach(sensor => {
                        const option = document.createElement('option');
                        option.value = sensor;
                        option.textContent = sensor.replace(/_/g, ' ').replace(/TOTAL/g, 'Gesamt');
                        select.appendChild(option);
                    });
                    updateDataStatus(true);
                } else {
                    updateDataStatus(false);
                }
            } catch (error) {
                showError('Fehler beim Laden der Sensoren: ' + error.message);
                updateDataStatus(false);
            }
        }

        // Statistiken laden
        async function loadStats() {
            try {
                const response = await fetch('/api/sensors/overview');
                const data = await response.json();
                
                const statsGrid = document.getElementById('stats-grid');
                statsGrid.innerHTML = '';
                
                if (data.sensors.length === 0) {
                    statsGrid.innerHTML = '<div class="loading">Keine Daten verfügbar</div>';
                    return;
                }
                
                data.sensors.forEach(sensor => {
                    const card = document.createElement('div');
                    card.className = 'stat-card';
                    const sensorName = sensor.sensorType.replace(/_/g, ' ').replace(/TOTAL/g, 'Gesamt');
                    const unit = getUnitForSensor(sensor.sensorType);
                    card.innerHTML = \`
                        <h3>\${sensorName}</h3>
                        <div class="stat-value">\${sensor.latest.toFixed(1)}\${unit}</div>
                        <div class="stat-label">Aktueller Wert</div>
                        <div class="stat-details">
                            Min: \${sensor.min.toFixed(1)}\${unit} | Max: \${sensor.max.toFixed(1)}\${unit} | Ø: \${sensor.avg.toFixed(1)}\${unit}
                        </div>
                    \`;
                    statsGrid.appendChild(card);
                });
            } catch (error) {
                showError('Fehler beim Laden der Statistiken: ' + error.message);
            }
        }

        // Chart-Daten laden
        async function loadChartData() {
            if (!currentSensor) return;
            
            try {
                const response = await fetch(\`/api/sensor/\${currentSensor}/data?hours=\${currentHours}\`);
                const data = await response.json();
                
                if (data.data.length === 0) {
                    showError('Keine Daten für den ausgewählten Zeitraum verfügbar');
                    return;
                }
                
                updateChart(data.data);
            } catch (error) {
                showError('Fehler beim Laden der Chart-Daten: ' + error.message);
            }
        }

        // Chart aktualisieren
        function updateChart(data) {
            const ctx = document.getElementById('data-chart').getContext('2d');
            
            if (chart) {
                chart.destroy();
            }
            
            const labels = data.map(point => new Date(point.timestamp).toLocaleTimeString());
            const values = data.map(point => point.value);
            const sensorName = currentSensor.replace(/_/g, ' ').replace(/TOTAL/g, 'Gesamt');
            const unit = getUnitForSensor(currentSensor);
            
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: sensorName + unit,
                        data: values,
                        borderColor: '#007aff',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f2f2f7',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#86868b',
                                font: {
                                    size: 12
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: '#f2f2f7',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#86868b',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#1d1d1f',
                                font: {
                                    size: 14,
                                    weight: '500'
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }

        // Auto-Refresh starten
        function startAutoRefresh() {
            refreshInterval = setInterval(() => {
                loadStats();
                if (currentSensor) {
                    loadChartData();
                }
            }, ${this.config.refreshInterval * 1000});
        }

        // Einheiten für Sensoren
        function getUnitForSensor(sensorType) {
            if (sensorType.includes('power')) return ' W';
            if (sensorType.includes('energy')) return ' kWh';
            if (sensorType.includes('temperature')) return ' °C';
            if (sensorType.includes('voltage')) return ' V';
            if (sensorType.includes('current')) return ' A';
            if (sensorType.includes('efficiency')) return ' %';
            if (sensorType.includes('frequency')) return ' Hz';
            if (sensorType.includes('rssi')) return ' dBm';
            return '';
        }
        
        // Status-Updates
        function updateDataStatus(hasData) {
            const dataStatus = document.getElementById('data-status');
            const lastUpdate = document.getElementById('last-update');
            
            if (hasData) {
                dataStatus.className = 'status-dot';
                lastUpdate.textContent = 'Letzte Aktualisierung: ' + new Date().toLocaleTimeString();
            } else {
                dataStatus.className = 'status-dot warning';
                lastUpdate.textContent = 'Letzte Aktualisierung: Keine Daten';
            }
        }
        
        function updateMqttStatus(connected) {
            const mqttStatus = document.getElementById('mqtt-status');
            if (connected) {
                mqttStatus.className = 'status-dot';
            } else {
                mqttStatus.className = 'status-dot error';
            }
        }
        
        // Fehler anzeigen
        function showError(message) {
            const errorContainer = document.getElementById('error-container');
            errorContainer.innerHTML = \`<div class="error">\${message}</div>\`;
            setTimeout(() => {
                errorContainer.innerHTML = '';
            }, 5000);
        }

        // Cleanup beim Verlassen
        window.addEventListener('beforeunload', function() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        });
    </script>
</body>
</html>
    `;
  }
}

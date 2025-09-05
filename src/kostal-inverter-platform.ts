import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

export class KostalInverterPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  private baseUrl: string;
  private pollingInterval: NodeJS.Timeout | null = null;
  private mainAccessory: PlatformAccessory | null = null;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.info('Kostal Inverter Platform initialisiert');

    // HTTP-Client initialisieren
    const host = this.config.host || '192.168.178.71';
    const port = this.config.port || 80;
    this.baseUrl = `http://${host}:${port}`;

    this.log.info(`HTTP-Client initialisiert für ${this.baseUrl}`);

    this.api.on('didFinishLaunching', () => {
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Konfiguriere Accessory:', accessory.displayName);
    // Speichere den Hauptwechselrichter-Accessory
    if (accessory.context.device?.type === 'main') {
      this.mainAccessory = accessory;
    }
  }

  private discoverDevices() {
    // Erstelle nur den Hauptwechselrichter - minimal und sauber
    const deviceName = 'Kostal Plenticore';
    const uuid = this.api.hap.uuid.generate('Kostal-Main-001');
    
    if (this.mainAccessory) {
      this.log.info('Accessory bereits vorhanden:', deviceName);
      // Services werden nicht mehrfach erstellt
    } else {
      this.log.info('Erstelle neuen Accessory:', deviceName);
      this.createAccessory(deviceName, uuid);
    }

    // Starte Daten-Polling
    this.startDataPolling();
  }

  private createAccessory(deviceName: string, uuid: string) {
    const accessory = new this.api.platformAccessory(deviceName, uuid);
    
    // Setze Kontext
    accessory.context.device = {
      name: deviceName,
      type: 'main',
      serialNumber: 'KOSTAL-MAIN-001'
    };
    
    // Registriere den Accessory
    this.api.registerPlatformAccessories('homebridge-kostal-inverter', 'KostalInverter', [accessory]);
    
    // Erstelle Services nur einmal
    this.createMainServices(accessory);
    
    // Speichere Referenz
    this.mainAccessory = accessory;
  }

  private createMainServices(accessory: PlatformAccessory) {
    // Accessory Information
    accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'Kostal')
      .setCharacteristic(this.Characteristic.Model, 'Plenticore')
      .setCharacteristic(this.Characteristic.SerialNumber, 'KOSTAL-MAIN-001');

    // 🍃 Apple Home Energy Provider (iOS 16+) - Outlet Service als Energy Provider
    const energyProviderService = accessory.addService(this.Service.Outlet, 'Kostal Solar', 'energy-provider');
    
    // Outlet Characteristics (funktioniert als Energy Provider)
    energyProviderService.setCharacteristic(this.Characteristic.On, false); // Produktionsstatus
    energyProviderService.setCharacteristic(this.Characteristic.OutletInUse, false); // Energieerzeugung
    
    // Wichtig: Setze die korrekte Kategorie für Energy Provider
    accessory.category = this.api.hap.Categories.OUTLET;

    // Zusätzliche Services für bessere HomeKit-Integration
    // Hauptwechselrichter - Light Sensor für detaillierte Leistung
    const powerService = accessory.addService(this.Service.LightSensor, 'Solar Leistung', 'power'); 
    powerService.setCharacteristic(this.Characteristic.CurrentAmbientLightLevel, 0.0001);
    
    // Temperatur Service
    const tempService = accessory.addService(this.Service.TemperatureSensor, 'Wechselrichter Temperatur', 'temp');
    tempService.setCharacteristic(this.Characteristic.CurrentTemperature, 20);
    
    // Contact Sensor für Produktionsstatus
    const statusService = accessory.addService(this.Service.ContactSensor, 'Solar Status', 'status');
    statusService.setCharacteristic(this.Characteristic.ContactSensorState, 
      this.Characteristic.ContactSensorState.CONTACT_DETECTED);
  }

  private startDataPolling() {
    this.log.info('Daten-Polling gestartet mit 30s Intervall');
    
    this.pollingInterval = setInterval(async () => {
      await this.updateAccessoryData();
    }, 30000);
  }

  private async updateAccessoryData() {
    try {
      this.log.debug('🔄 Starte Daten-Abruf...');
      
      // Hole echte Daten von der Kostal-API
      const data = await this.fetchKostalData();
      
      // Zeige wichtige Daten in kompakter Form
      this.logCurrentData(data);
      
      // Aktualisiere den Hauptwechselrichter-Accessory
      if (this.mainAccessory) {
        this.updateMainAccessoryData(this.mainAccessory, data);
      }
      
      this.log.debug('✅ Accessory-Daten aktualisiert');
    } catch (error) {
      this.log.error('❌ Fehler beim Abrufen der Daten:', error);
    }
  }

  private lastLogTime = 0;
  private readonly LOG_INTERVAL = 15 * 60 * 1000; // 15 Minuten in Millisekunden
  private isFirstLog = true; // Erste Log sofort schreiben

  private logCurrentData(data: any) {
    const power = Math.max(0, data.process?.power || 0);
    const energy = data.process?.energy || 0;
    const isRunning = data.system?.status === 'running';
    const temp = data.system?.temperature || 20;
    
    // Kompakte Anzeige der wichtigsten Daten
    this.log.info(`📊 KOSTAL STATUS: ${power.toFixed(1)}W | ${energy.toFixed(1)}kWh | ${temp.toFixed(1)}°C | ${isRunning ? 'PRODUCING' : 'OFF'}`);
    
    // Datensparendes Logging alle 15 Minuten (erste Log sofort)
    const now = Date.now();
    if (this.isFirstLog || now - this.lastLogTime >= this.LOG_INTERVAL) {
      this.logDetailedData(data);
      this.lastLogTime = now;
      this.isFirstLog = false;
    }
    
    // Detaillierte Daten nur bei Debug
    if (this.config.debug) {
      this.log.debug('📋 Vollständige Daten:', JSON.stringify(data, null, 2));
    }
  }

  private logDetailedData(data: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      power: data.process?.power || 0,
      energy: data.process?.energy || 0,
      temperature: data.system?.temperature || 20,
      status: data.system?.status || 'off',
      modules: data.modules || [],
      rawData: data
    };
    
    // Log in strukturiertem Format für einfache Auswertung
    this.log.info(`📈 DATA_LOG: ${JSON.stringify(logEntry)}`);
    
    // Zusätzlich in separate Datei schreiben
    this.writeToDataLog(logEntry);
  }

  private writeToDataLog(logEntry: any) {
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(require('os').homedir(), '.homebridge', 'logs', 'kostal-data');
      
      // Erstelle Log-Verzeichnis falls nicht vorhanden
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `kostal-data-${new Date().toISOString().split('T')[0]}.jsonl`);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(logFile, logLine);
      
      // Zusätzlich: Speichere Daten für Tagesreport
      this.storeDataForDailyReport(logEntry);
    } catch (error) {
      this.log.error('❌ Fehler beim Schreiben der Daten-Logs:', error);
    }
  }

  private storeDataForDailyReport(logEntry: any) {
    try {
      const fs = require('fs');
      const path = require('path');
      const dataDir = path.join(require('os').homedir(), '.homebridge', 'kostal-data');
      
      // Erstelle Datenverzeichnis falls nicht vorhanden
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Nur alle 5 Minuten speichern (ressourcenschonend)
      const now = new Date();
      const lastSaveKey = 'lastDataSave';
      const lastSave = this[lastSaveKey as keyof this] as number || 0;
      
      if (now.getTime() - lastSave < 5 * 60 * 1000) { // 5 Minuten
        return;
      }
      
      (this as any)[lastSaveKey] = now.getTime();
      
      // Speichere Daten für aktuellen Tag
      const dateStr = now.toISOString().split('T')[0];
      const dataFile = path.join(dataDir, `${dateStr}.json`);
      
      let dayData = [];
      if (fs.existsSync(dataFile)) {
        try {
          dayData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        } catch (e) {
          dayData = [];
        }
      }
      
      // Füge neuen Datenpunkt hinzu
      dayData.push({
        timestamp: logEntry.timestamp,
        power: logEntry.power,
        energy: logEntry.energy,
        temperature: logEntry.temperature,
        status: logEntry.status,
        is_producing: logEntry.status === 'running'
      });
      
      // Speichere aktualisierte Daten
      fs.writeFileSync(dataFile, JSON.stringify(dayData, null, 2));
      
      this.log.debug(`📊 Tagesreport-Daten gespeichert: ${dayData.length} Datenpunkte`);
    } catch (error) {
      this.log.error('❌ Fehler beim Speichern der Tagesreport-Daten:', error);
    }
  }

  private logAvailableServices(accessory: PlatformAccessory) {
    const services = accessory.services;
    const serviceNames = services.map(service => {
      const serviceType = service.UUID;
      const displayName = service.displayName || 'Unnamed';
      const subtype = service.subtype || 'default';
      return `${displayName} (${serviceType}) [${subtype}]`;
    });
    
    this.log.info(`🔧 Verfügbare Services: ${serviceNames.join(', ')}`);
  }

  private async fetchKostalData() {
    try {
      // Debug: Zeige Konfiguration
      this.log.debug('🔧 Konfiguration:', JSON.stringify({
        usePythonBridge: this.config.advanced?.usePythonBridge,
        advanced: this.config.advanced
      }, null, 2));
      
      // Versuche zuerst die Python-Bridge
      if (this.config.advanced?.usePythonBridge) {
        this.log.debug('🐍 Verwende Python-Bridge für Daten-Abruf...');
        const pythonData = await this.fetchKostalDataPython();
        if (pythonData && !pythonData.error) {
          this.log.debug('✅ Python-Bridge erfolgreich');
          return pythonData;
        } else {
          this.log.warn('⚠️ Python-Bridge fehlgeschlagen, verwende TypeScript-Implementierung');
        }
      }
      
      this.log.debug('🔍 Sammle alle verfügbaren Daten von der Kostal-API...');
      
      // Sammle alle verfügbaren Daten von der Kostal-API
      const allData = await this.gatherAllInverterData();
      
      this.log.debug('🔍 Extrahiere relevante Daten...');
      
      // Extrahiere relevante Daten
      const inverterState = this.extractInverterState(allData);
      
      const result = {
        process: {
          power: inverterState.power,
          energy: inverterState.energy,
        },
        system: {
          temperature: inverterState.temperature,
          status: inverterState.status,
        },
      };
      
      this.log.debug('🔍 Extrahierte Daten:', JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      this.log.warn('⚠️ Konnte keine echten Daten abrufen, verwende Simulierte Daten:', error);
      return this.getSimulatedData();
    }
  }

  private async fetchKostalDataPython(): Promise<any> {
    try {
      const { spawn } = require('child_process');
      const path = require('path');
      
      // Pfad zur Python-Bridge
      const pythonBridgePath = path.join(__dirname, '..', 'kostal_python_bridge.py');
      
      // Konfiguration für Python-Bridge
      const config = {
        host: this.config.host,
        port: this.config.port,
        password: this.config.password
      };
      
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [pythonBridgePath], {
          cwd: path.join(__dirname, '..'),
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data: Buffer) => {
          errorOutput += data.toString();
        });
        
        pythonProcess.on('close', (code: number) => {
          if (code === 0) {
            try {
              const result = JSON.parse(output);
              resolve(result);
            } catch (parseError) {
              this.log.error('❌ Fehler beim Parsen der Python-Ausgabe:', parseError);
              reject(parseError);
            }
          } else {
            this.log.error('❌ Python-Bridge Fehler:', errorOutput);
            reject(new Error(`Python-Bridge exited with code ${code}: ${errorOutput}`));
          }
        });
        
        // Sende Konfiguration an Python-Bridge
        pythonProcess.stdin.write(JSON.stringify(config) + '\n');
        pythonProcess.stdin.end();
      });
    } catch (error) {
      this.log.error('❌ Fehler beim Aufrufen der Python-Bridge:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async gatherAllInverterData() {
    const data = {
      processData: [] as any[],
      inverterState: null as any,
      acData: null as any,
      powermeterData: null as any,
      pvData: {} as any,
      energyFlowData: null as any,
      batteryData: null as any,
      homeData: null as any
    };

    try {
      // Authentifizierung (falls erforderlich)
      const authHeaders = this.getAuthHeaders();

      // 1. Haupt-Prozessdaten (alle verfügbaren Module)
      const processResponse = await fetch(`${this.baseUrl}/api/v1/processdata`, {
        headers: authHeaders
      });
      if (processResponse.ok) {
        data.processData = await processResponse.json() as any[];
        this.log.debug(`ProcessData abgerufen: ${data.processData.length} Module`);
        
        // Für jeden verfügbaren Modul die echten Daten abrufen
        for (const module of data.processData) {
          if (module.processdataids && module.processdataids.length > 0) {
            const moduleResponse = await fetch(`${this.baseUrl}/api/v1/processdata/${module.moduleid}`, {
              headers: authHeaders
            });
            if (moduleResponse.ok) {
              const moduleData = await moduleResponse.json() as any;
              // Ersetze das Modul mit den echten Daten
              const moduleIndex = data.processData.findIndex(m => m.moduleid === module.moduleid);
              if (moduleIndex !== -1) {
                data.processData[moduleIndex] = moduleData[0] || moduleData;
              }
            }
          }
        }
      }

      // 2. Wechselrichter-Status (devices:local)
      const inverterResponse = await fetch(`${this.baseUrl}/api/v1/processdata/devices:local`, {
        headers: authHeaders
      });
      if (inverterResponse.ok) {
        data.inverterState = await inverterResponse.json();
      }

      // 3. AC-Daten (Netz)
      const acResponse = await fetch(`${this.baseUrl}/api/v1/processdata/devices:local:ac`, {
        headers: authHeaders
      });
      if (acResponse.ok) {
        data.acData = await acResponse.json();
      }

      // 4. Powermeter-Daten (verschiedene Endpunkte testen)
      const powermeterEndpoints = [
        'devices:local:powermeter',
        'devices:local:powermeter:1',
        'devices:local:powermeter:2',
        'devices:local:powermeter:3',
        'devices:local:powermeter:grid',
        'devices:local:powermeter:home',
        'devices:local:powermeter:consumption',
        'devices:local:powermeter:load'
      ];

      for (const endpoint of powermeterEndpoints) {
        try {
          const powermeterResponse = await fetch(`${this.baseUrl}/api/v1/processdata/${endpoint}`, {
            headers: authHeaders
          });
      if (powermeterResponse.ok) {
            const powermeterData = await powermeterResponse.json() as any;
            if (powermeterData && Array.isArray(powermeterData) && powermeterData.length > 0) {
              this.log.info(`🔌 Powermeter ${endpoint} gefunden:`, JSON.stringify(powermeterData, null, 2));
              data.powermeterData = powermeterData;
              break; // Ersten gefundenen Powermeter verwenden
            }
          }
        } catch (error) {
          this.log.debug(`Powermeter ${endpoint} nicht verfügbar:`, error);
        }
      }

      // 5. PV-String-Daten (Plenticore Plus spezifisch)
      for (let i = 1; i <= this.config.strings; i++) {
        const pvResponse = await fetch(`${this.baseUrl}/api/v1/processdata/devices:local:pv${i}`, {
          headers: authHeaders
        });
        if (pvResponse.ok) {
          data.pvData[`pv${i}`] = await pvResponse.json();
          this.log.debug(`PV String ${i} abgerufen`);
        }
      }

      // 6. Batterie-Daten (falls vorhanden) - Plenticore Plus spezifisch
      const batteryResponse = await fetch(`${this.baseUrl}/api/v1/processdata/devices:local:battery`, {
        headers: authHeaders
      });
      if (batteryResponse.ok) {
        data.batteryData = await batteryResponse.json();
        this.log.debug('Battery Data abgerufen');
      }

      // 7. Hausverbrauch-Daten - Plenticore Plus spezifisch
      const homeResponse = await fetch(`${this.baseUrl}/api/v1/processdata/devices:local:home`, {
        headers: authHeaders
      });
      if (homeResponse.ok) {
        data.homeData = await homeResponse.json();
        this.log.debug('Home Data abgerufen');
      }

      // 8. Home Assistant pykoplenti API-Methode
      // Versuche die gleiche API-Methode wie Home Assistant zu verwenden
      // Home Assistant verwendet pykoplenti Python-Bibliothek
      
      // Versuche alle verfügbaren Datenpunkte aus devices:local abzurufen
      try {
        const allLocalDataResponse = await fetch(`${this.baseUrl}/api/v1/processdata/devices:local`, {
          headers: authHeaders
        });
        if (allLocalDataResponse.ok) {
          const allLocalData = await allLocalDataResponse.json() as any;
          this.log.info(`🏠 Alle devices:local Daten:`, JSON.stringify(allLocalData, null, 2));
          
          // Extrahiere alle verfügbaren Datenpunkte
          if (allLocalData && Array.isArray(allLocalData) && allLocalData.length > 0) {
            const localModule = allLocalData[0];
            if (localModule.processdata && Array.isArray(localModule.processdata)) {
              for (const dataPoint of localModule.processdata) {
                this.log.info(`🏠 Local Datenpunkt: ${dataPoint.id} = ${dataPoint.value} ${dataPoint.unit || ''}`);
                
                // Spezifische Datenpunkte extrahieren
                switch (dataPoint.id) {
                  case 'Home_P': {
                    const homePower = parseFloat(dataPoint.value) || 0;
                    if (homePower > 0) {
                      this.log.info(`🏠 Home Power gefunden: ${homePower}W`);
                    }
                    break;
                  }
                  case 'Grid_P': {
                    const gridPower = parseFloat(dataPoint.value) || 0;
                    this.log.info(`⚡ Grid Power gefunden: ${gridPower}W`);
                    break;
                  }
                  case 'PV_P': {
                    const pvPower = parseFloat(dataPoint.value) || 0;
                    if (pvPower > 0) {
                      this.log.info(`☀️ PV Power gefunden: ${pvPower}W`);
                    }
                    break;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        this.log.error(`❌ Fehler beim Abrufen aller devices:local Daten:`, error);
      }



      // 9. Versuche alternative API-Endpunkte für Nacht-Betrieb
      const alternativeEndpoints = [
        '/api/v1/processdata',
        '/api/v1/processdata/devices:local',
        '/api/v1/processdata/devices:local:ac',
        '/api/v1/processdata/devices:local:powermeter',
        '/api/v1/processdata/scb:statistic:EnergyFlow'
      ];

      for (const endpoint of alternativeEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: authHeaders
          });
          if (response.ok) {
            const endpointData = await response.json() as any;
            this.log.debug(`Alternative API ${endpoint}:`, JSON.stringify(endpointData, null, 2));
          }
        } catch (error) {
          this.log.debug(`Fehler bei alternativer API ${endpoint}:`, error);
        }
      }

      // 8. Energiefluss-Statistiken
      const energyResponse = await fetch(`${this.baseUrl}/api/v1/processdata/scb:statistic:EnergyFlow`, {
        headers: authHeaders
      });
      if (energyResponse.ok) {
        data.energyFlowData = await energyResponse.json();
      }

      this.log.debug(`Alle API-Daten erfolgreich abgerufen: ${Object.keys(data).filter(k => data[k as keyof typeof data] !== null).length} Module`);
      
      // Debug: Zeige rohe API-Daten für Plenticore Plus
      if (this.config.debug) {
        this.log.info('=== ROHDATEN VOM PLENTICORE PLUS 5.5 ===');
        this.log.info('ProcessData Module:', JSON.stringify(data.processData, null, 2));
        if (data.inverterState) {
          this.log.info('Inverter State:', JSON.stringify(data.inverterState, null, 2));
        }
        if (data.acData) {
          this.log.info('AC Data (Netz):', JSON.stringify(data.acData, null, 2));
        }
        if (data.powermeterData) {
          this.log.info('🔌 Powermeter Data:', JSON.stringify(data.powermeterData, null, 2));
        }
        if (Object.keys(data.pvData).length > 0) {
          this.log.info('PV Data (Solar):', JSON.stringify(data.pvData, null, 2));
        }
        if (data.batteryData) {
          this.log.info('Battery Data:', JSON.stringify(data.batteryData, null, 2));
        }
        if (data.homeData) {
          this.log.info('Home Data (Verbrauch):', JSON.stringify(data.homeData, null, 2));
        }
        if (data.energyFlowData) {
          this.log.info('Energy Flow Data:', JSON.stringify(data.energyFlowData, null, 2));
        }
        this.log.info('=== ENDE ROHDATEN ===');
      }
      
    } catch (error) {
      this.log.warn('Fehler beim Abrufen der API-Daten:', error);
    }

    return data;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // HTTP Basic Auth falls Username/Password konfiguriert
    if (this.config.username && this.config.password) {
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    return headers;
  }

  private extractInverterState(allData: any) {
    let power = 0.0001;
    let energy = 0;
    let temperature = 20;
    let status = 'unknown';
    let batteryPower = 0;
    let homeConsumption = 0;
    let gridPower = 0;

    try {
      // Suche nach Wechselrichter-Daten (Plenticore Plus spezifisch)
      const processData = allData.processData || [];
      for (const module of processData) {
        if (module.moduleid === 'devices:local') {
          // Wechselrichter-Status und Leistungsdaten
          for (const data of module.processdata || []) {
            switch (data.id) {
              case 'Inverter:State':
              const stateValue = parseFloat(data.value);
              status = this.mapInverterState(stateValue);
                break;
              case 'Home_P': // Hausverbrauch
                homeConsumption = parseFloat(data.value) || 0;
                break;
              case 'PV_P': // PV-Leistung
                const pvPowerValue = parseFloat(data.value);
                if (!isNaN(pvPowerValue) && pvPowerValue > power) {
                  power = Math.max(0.0001, pvPowerValue);
                }
                break;
              case 'Home_TotalEnergy': // Gesamtenergie
              case 'PV_TotalEnergy': // PV-Gesamtenergie
                const energyValue = parseFloat(data.value);
                if (!isNaN(energyValue)) {
                  energy = energyValue / 1000; // Wh zu kWh
                }
                break;
              case 'Inverter:Temperature': // Wechselrichter-Temperatur
                const tempValue = parseFloat(data.value);
                if (!isNaN(tempValue)) {
                  temperature = tempValue;
                }
                break;
              // Weitere wichtige Datenpunkte für Plenticore Plus
              case 'PV_TotalPower': // Gesamte PV-Leistung
                const totalPvPower = parseFloat(data.value);
                if (!isNaN(totalPvPower) && totalPvPower > power) {
                  power = Math.max(0.0001, totalPvPower);
                }
                break;
              case 'Home_TotalPower': // Gesamte Hausleistung
                const totalHomePower = parseFloat(data.value);
                if (!isNaN(totalHomePower)) {
                  homeConsumption = totalHomePower;
                }
                break;
            }
          }
        }
        
        // PV-String-Daten für detaillierte Leistung
        if (module.moduleid?.startsWith('devices:local:pv')) {
          for (const data of module.processdata || []) {
            if (data.id && (data.id.includes('Power') || data.id.includes('P'))) {
              const powerValue = parseFloat(data.value);
              if (!isNaN(powerValue) && powerValue > 0) {
                power = Math.max(power, powerValue);
              }
            }
          }
        }

        // AC-Daten (Netzanschluss) - auch bei Nacht verfügbar
        if (module.moduleid === 'devices:local:ac') {
          for (const data of module.processdata || []) {
            switch (data.id) {
              case 'P': // Leistung
                gridPower = parseFloat(data.value) || 0;
                break;
              case 'U': // Spannung
              case 'I': // Strom
              case 'F': // Frequenz
                this.log.debug(`AC ${data.id}: ${data.value} ${data.unit || ''}`);
                break;
            }
          }
        }

        // Korrekte Datenpunkte basierend auf Home Assistant Diagnose
        // devices:local:powermeter hat: P, Q, S, L1_P, L1_U, L1_I, L2_P, L2_U, L2_I, L3_P, L3_U, L3_I, CosPhi, Frequency
        if (module.moduleid === 'devices:local:powermeter') {
          for (const data of module.processdata || []) {
            switch (data.id) {
              case 'P': // Gesamtleistung (Hausverbrauch)
                const totalPower = parseFloat(data.value) || 0;
                if (totalPower > 0) {
                  homeConsumption = totalPower;
                  this.log.info(`🔌 Powermeter Gesamtleistung: ${totalPower}W`);
                }
                break;
              case 'L1_P': // L1 Leistung
              case 'L2_P': // L2 Leistung  
              case 'L3_P': // L3 Leistung
                const phasePower = parseFloat(data.value) || 0;
                if (phasePower > 0) {
                  this.log.info(`🔌 Powermeter ${data.id}: ${phasePower}W`);
                }
                break;
              case 'L1_U': // L1 Spannung
              case 'L2_U': // L2 Spannung
              case 'L3_U': // L3 Spannung
                this.log.info(`🔌 Powermeter ${data.id}: ${data.value}V`);
                break;
              case 'L1_I': // L1 Strom
              case 'L2_I': // L2 Strom
              case 'L3_I': // L3 Strom
                this.log.info(`🔌 Powermeter ${data.id}: ${data.value}A`);
                break;
              case 'Frequency': // Frequenz
                this.log.info(`🔌 Powermeter Frequenz: ${data.value}Hz`);
                break;
              case 'CosPhi': // Leistungsfaktor
                this.log.info(`🔌 Powermeter CosPhi: ${data.value}`);
                break;
              default:
                this.log.info(`🔌 Powermeter ${data.id}: ${data.value} ${data.unit || ''}`);
                break;
            }
          }
        }

        // devices:local hat: Home_P, Grid_P, Battery_P, etc. (Home Assistant Daten)
        if (module.moduleid === 'devices:local') {
          for (const data of module.processdata || []) {
            switch (data.id) {
              case 'Inverter:State': // Wechselrichter Status
                const inverterState = parseInt(data.value) || 0;
                this.log.info(`🏠 Inverter State: ${inverterState}`);
                break;
              case 'Home_P': // Hausverbrauch (595 W in Home Assistant)
                const homePower = parseFloat(data.value) || 0;
                if (homePower > 0) {
                  homeConsumption = homePower;
                  this.log.info(`🏠 Home Power: ${homePower}W (Home Assistant: 595W)`);
                }
                break;
              case 'Grid_P': // Netzleistung (592 W in Home Assistant)
                const gridPower = parseFloat(data.value) || 0;
                this.log.info(`⚡ Grid Power: ${gridPower}W (Home Assistant: 592W)`);
                break;
              case 'PV_P': // PV Leistung (0 W in Home Assistant)
                const pvPower = parseFloat(data.value) || 0;
                if (pvPower > 0) {
                  power = pvPower;
                  this.log.info(`☀️ PV Power: ${pvPower}W`);
                }
                break;
              case 'Battery_P': // Batterie Leistung (0 W in Home Assistant)
                const batteryPower = parseFloat(data.value) || 0;
                this.log.info(`🔋 Battery Power: ${batteryPower}W`);
                break;
              case 'HomeOwn_P': // Home Power from Own (0 W in Home Assistant)
                const homeOwnPower = parseFloat(data.value) || 0;
                this.log.info(`🏠 Home Power from Own: ${homeOwnPower}W`);
                break;
              case 'HomePv_P': // Home Power from PV (0 W in Home Assistant)
                const homePvPower = parseFloat(data.value) || 0;
                this.log.info(`☀️ Home Power from PV: ${homePvPower}W`);
                break;
              case 'HomeGrid_P': // Home Power from Grid (592 W in Home Assistant)
                const homeGridPower = parseFloat(data.value) || 0;
                this.log.info(`⚡ Home Power from Grid: ${homeGridPower}W`);
                break;
              case 'HomeBat_P': // Home Power from Battery (0 W in Home Assistant)
                const homeBatPower = parseFloat(data.value) || 0;
                this.log.info(`🔋 Home Power from Battery: ${homeBatPower}W`);
                break;
              case 'Bat2Grid_P': // Battery to Grid Power
                const bat2GridPower = parseFloat(data.value) || 0;
                this.log.info(`🔋➡️⚡ Battery to Grid: ${bat2GridPower}W`);
                break;
              case 'Grid2Bat_P': // Grid to Battery Power
                const grid2BatPower = parseFloat(data.value) || 0;
                this.log.info(`⚡➡️🔋 Grid to Battery: ${grid2BatPower}W`);
                break;
              case 'PV2Bat_P': // PV to Battery Power (0 W in Home Assistant)
                const pv2BatPower = parseFloat(data.value) || 0;
                this.log.info(`☀️➡️🔋 PV to Battery: ${pv2BatPower}W`);
                break;
              default:
                this.log.info(`🏠 Local ${data.id}: ${data.value} ${data.unit || ''}`);
                break;
            }
          }
        }

        // Batterie-Daten (falls vorhanden)
        if (module.moduleid === 'devices:local:battery') {
          for (const data of module.processdata || []) {
            switch (data.id) {
              case 'P': // Leistung
                batteryPower = parseFloat(data.value) || 0;
                break;
              case 'SOC': // Ladezustand
              case 'U': // Spannung
              case 'I': // Strom
                this.log.debug(`Battery ${data.id}: ${data.value} ${data.unit || ''}`);
                break;
            }
          }
        }

        // Energiefluss-Statistiken
        if (module.moduleid === 'scb:statistic:EnergyFlow') {
          for (const data of module.processdata || []) {
            switch (data.id) {
              case 'Home_P': // Hausverbrauch
                const homePower = parseFloat(data.value) || 0;
                if (homePower > 0) {
                  homeConsumption = homePower;
                }
                break;
              case 'Grid_P': // Netzleistung
                const gridPowerStat = parseFloat(data.value) || 0;
                if (gridPowerStat !== 0) {
                  gridPower = gridPowerStat;
                }
                break;
              case 'PV_P': // PV-Leistung
                const pvPowerStat = parseFloat(data.value) || 0;
                if (pvPowerStat > power) {
                  power = Math.max(0.0001, pvPowerStat);
                }
                break;
            }
          }
        }
      }
    } catch (error) {
      this.log.warn('Fehler beim Parsen der API-Daten:', error);
    }

    this.log.debug(`Extrahierte Daten: PV=${power}W, Home=${homeConsumption}W, Grid=${gridPower}W, Battery=${batteryPower}W, ${energy}kWh, ${temperature}°C, Status: ${status}`);
    
    // Zusätzliche Debug-Informationen für Nacht-Betrieb
    if (status === 'off' && homeConsumption === 0 && gridPower === 0) {
      this.log.info('🌙 Nacht-Modus: Wechselrichter aus, aber Hausverbrauch sollte verfügbar sein');
      this.log.info('💡 Prüfe ob Powermeter oder AC-Daten verfügbar sind');
    }
    
    return { power, energy, temperature, status, batteryPower, homeConsumption, gridPower };
  }

  private mapInverterState(stateValue: number): string {
    // Kostal Plenticore Plus Status-Codes mappen
    switch (stateValue) {
      case 0: return 'off';           // Wechselrichter aus
      case 1: return 'starting';      // Startvorgang
      case 2: return 'running';       // Normaler Betrieb
      case 3: return 'stopping';      // Stoppvorgang
      case 4: return 'error';         // Fehler
      case 5: return 'maintenance';   // Wartung
      case 6: return 'standby';       // Bereitschaft
      case 7: return 'grid_monitoring'; // Netzüberwachung
      case 8: return 'grid_connected';  // Netzverbunden
      case 9: return 'grid_disconnected'; // Netzgetrennt
      default: return `unknown_${stateValue}`;
    }
  }

  private getSimulatedData() {
    // Simulierte Daten für Tests
    return {
      process: {
        power: 0.0001 + Math.random() * 5000,
        energy: Math.random() * 100,
      },
      system: {
        temperature: 20 + Math.random() * 30,
        status: 'running',
      },
    };
  }

  private updateMainAccessoryData(accessory: PlatformAccessory, data: any) {
    const power = Math.max(0, data.process?.power || 0);
    const energy = data.process?.energy || 0;
    const isRunning = data.system?.status === 'running';
    const temp = data.system?.temperature || 20;

    // Zeige verfügbare Services
    this.logAvailableServices(accessory);

    // 🍃 Aktualisiere Apple Home Energy Provider (Outlet Service)
    const energyProviderService = accessory.getServiceById(this.Service.Outlet, 'energy-provider');
    if (energyProviderService) {
      // Outlet - Produktionsstatus (On/Off)
      energyProviderService.updateCharacteristic(this.Characteristic.On, isRunning);
      
      // Outlet - Energieerzeugung (OutletInUse)
      energyProviderService.updateCharacteristic(this.Characteristic.OutletInUse, power > 0);
      
      this.log.info(`🔌 Energy Provider aktualisiert: ${power}W | ${isRunning ? 'PRODUCING' : 'NOT_PRODUCING'}`);
    } else {
      this.log.warn('⚠️ Energy Provider Service nicht gefunden!');
    }

    // Zusätzliche Services für detaillierte Überwachung
    // Aktualisiere Leistung (Light Sensor)
    const powerService = accessory.getService(this.Service.LightSensor);
    if (powerService) {
      const lightLevel = Math.max(0.0001, power);
      powerService.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, lightLevel);
    }
    
    // Aktualisiere Temperatur
    const tempService = accessory.getService(this.Service.TemperatureSensor);
    if (tempService) {
      tempService.updateCharacteristic(this.Characteristic.CurrentTemperature, temp);
    }
    
    // Aktualisiere Status
    const statusService = accessory.getService(this.Service.ContactSensor);
    if (statusService) {
      statusService.updateCharacteristic(this.Characteristic.ContactSensorState,
        isRunning ? this.Characteristic.ContactSensorState.CONTACT_DETECTED
                 : this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
    }
  }

  // Cleanup beim Beenden
  destroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}

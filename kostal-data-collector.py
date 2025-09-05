#!/usr/bin/env python3
"""
Kostal Data Collector
Sammelt Daten vom Homebridge Plugin und speist sie in den Tagesreport ein
"""

import json
import sys
import os
import subprocess
from datetime import datetime
from daily_energy_report import DailyEnergyReporter

class KostalDataCollector:
    def __init__(self, config_file="kostal_config.json"):
        self.config_file = config_file
        self.reporter = DailyEnergyReporter()
        self.load_config()
    
    def load_config(self):
        """Lade Konfiguration für Kostal Wechselrichter"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                self.config = json.load(f)
        else:
            # Standard-Konfiguration
            self.config = {
                "host": "192.168.178.71",
                "port": 80,
                "password": "pny6F0y9tC7qXnQ"
            }
            self.save_config()
    
    def save_config(self):
        """Speichere Konfiguration"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def collect_data_from_plugin(self):
        """Sammle Daten vom Homebridge Plugin"""
        try:
            # Führe das Python Bridge Script aus
            result = subprocess.run([
                'python3', 'kostal_python_bridge.py',
                '--host', self.config['host'],
                '--port', str(self.config['port']),
                '--password', self.config['password']
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                # Parse JSON Output
                data = json.loads(result.stdout)
                return data
            else:
                print(f"❌ Fehler beim Sammeln der Daten: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            print("❌ Timeout beim Sammeln der Daten")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ JSON Parse Fehler: {e}")
            return None
        except Exception as e:
            print(f"❌ Unerwarteter Fehler: {e}")
            return None
    
    def collect_and_store(self):
        """Sammle Daten und speichere sie"""
        print(f"🔄 Sammle Daten um {datetime.now().strftime('%H:%M:%S')}...")
        
        data = self.collect_data_from_plugin()
        if data is None:
            return False
        
        # Extrahiere relevante Daten
        extracted_data = {
            'timestamp': datetime.now().isoformat(),
            'power': data.get('process', {}).get('power', 0),
            'energy': data.get('process', {}).get('energy', 0),
            'temperature': data.get('system', {}).get('temperature', 20),
            'status': data.get('system', {}).get('status', 'off'),
            'is_producing': data.get('system', {}).get('status') == 'running'
        }
        
        # Speichere in Reporter
        self.reporter.add_data_point(extracted_data)
        
        print(f"✅ Daten gespeichert: {extracted_data['power']:.1f}W | {extracted_data['is_producing']}")
        return True
    
    def generate_today_report(self):
        """Generiere Report für heute"""
        print("📊 Generiere Tagesreport...")
        report = self.reporter.generate_daily_report()
        self.reporter.print_report(report)
        return report
    
    def run_continuous_collection(self, interval_minutes=5):
        """Führe kontinuierliche Datensammlung durch"""
        print(f"🚀 Starte kontinuierliche Datensammlung (alle {interval_minutes} Minuten)")
        print("Drücke Ctrl+C zum Beenden")
        
        import time
        
        try:
            while True:
                self.collect_and_store()
                time.sleep(interval_minutes * 60)
        except KeyboardInterrupt:
            print("\n🛑 Datensammlung beendet")
            # Generiere finalen Report
            self.generate_today_report()

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Kostal Data Collector')
    parser.add_argument('--collect', action='store_true', help='Sammle einmalig Daten')
    parser.add_argument('--continuous', type=int, metavar='MINUTES', help='Kontinuierliche Sammlung alle X Minuten')
    parser.add_argument('--report', action='store_true', help='Generiere Tagesreport')
    parser.add_argument('--date', help='Datum für Report (YYYY-MM-DD)')
    
    args = parser.parse_args()
    
    collector = KostalDataCollector()
    
    if args.collect:
        collector.collect_and_store()
    elif args.continuous:
        collector.run_continuous_collection(args.continuous)
    elif args.report:
        if args.date:
            from datetime import datetime
            date = datetime.strptime(args.date, '%Y-%m-%d').date()
            report = collector.reporter.generate_daily_report(date)
        else:
            report = collector.generate_today_report()
    else:
        # Standard: Sammle einmalig und zeige Report
        collector.collect_and_store()
        collector.generate_today_report()

if __name__ == "__main__":
    main()

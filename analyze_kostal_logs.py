#!/usr/bin/env python3
"""
Kostal Daten-Log Analyzer
Analysiert die gesammelten Kostal-Daten und zeigt Trends
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

def load_log_data(log_dir):
    """Lade alle Log-Daten aus dem Verzeichnis"""
    log_dir = Path(log_dir)
    all_data = []
    
    # Suche nach allen .jsonl Dateien
    for log_file in log_dir.glob("kostal-data-*.jsonl"):
        print(f"📁 Lade Daten aus: {log_file.name}")
        
        with open(log_file, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    all_data.append(data)
                except json.JSONDecodeError:
                    continue
    
    return sorted(all_data, key=lambda x: x['timestamp'])

def analyze_data(data):
    """Analysiere die gesammelten Daten"""
    if not data:
        print("❌ Keine Daten gefunden!")
        return
    
    print(f"\n📊 ANALYSE: {len(data)} Datenpunkte gefunden")
    print(f"📅 Zeitraum: {data[0]['timestamp']} bis {data[-1]['timestamp']}")
    
    # Statistiken
    powers = [d['power'] for d in data]
    temperatures = [d['temperature'] for d in data]
    statuses = [d['status'] for d in data]
    
    print(f"\n⚡ LEISTUNG:")
    print(f"  Min: {min(powers):.1f}W")
    print(f"  Max: {max(powers):.1f}W")
    print(f"  Durchschnitt: {sum(powers)/len(powers):.1f}W")
    
    print(f"\n🌡️ TEMPERATUR:")
    print(f"  Min: {min(temperatures):.1f}°C")
    print(f"  Max: {max(temperatures):.1f}°C")
    print(f"  Durchschnitt: {sum(temperatures)/len(temperatures):.1f}°C")
    
    print(f"\n🔄 STATUS:")
    status_counts = {}
    for status in statuses:
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in status_counts.items():
        percentage = (count / len(statuses)) * 100
        print(f"  {status}: {count} ({percentage:.1f}%)")
    
    # Zeige Datenpunkte mit echten Werten (nicht Fallback)
    real_data = [d for d in data if d['power'] > 0.001 or d['temperature'] != 20]
    if real_data:
        print(f"\n✅ ECHTE DATEN: {len(real_data)} Datenpunkte mit echten Werten")
        print("📋 Beispiele:")
        for i, d in enumerate(real_data[:5]):  # Zeige erste 5
            timestamp = datetime.fromisoformat(d['timestamp'].replace('Z', '+00:00'))
            print(f"  {timestamp.strftime('%H:%M:%S')}: {d['power']:.1f}W, {d['temperature']:.1f}°C, {d['status']}")
    else:
        print(f"\n⚠️ KEINE ECHTEN DATEN: Alle Werte sind Fallback-Werte")
        print("🔍 Mögliche Ursachen:")
        print("  - Wechselrichter ist ausgeschaltet")
        print("  - API-Endpunkte liefern keine Daten")
        print("  - Authentifizierung fehlgeschlagen")
        print("  - Netzwerk-Probleme")
    
    # Zeige verfügbare Module
    modules_found = set()
    for d in data:
        if 'modules' in d and d['modules']:
            for module in d['modules']:
                if isinstance(module, dict) and 'moduleid' in module:
                    modules_found.add(module['moduleid'])
    
    if modules_found:
        print(f"\n🔧 VERFÜGBARE MODULE:")
        for module in sorted(modules_found):
            print(f"  - {module}")
    else:
        print(f"\n⚠️ KEINE MODULE GEFUNDEN: API liefert keine Moduldaten")

def show_recent_data(data, hours=24):
    """Zeige die letzten X Stunden der Daten"""
    if not data:
        return
    
    cutoff_time = datetime.now() - timedelta(hours=hours)
    recent_data = []
    
    for d in data:
        try:
            timestamp = datetime.fromisoformat(d['timestamp'].replace('Z', '+00:00'))
            if timestamp >= cutoff_time:
                recent_data.append(d)
        except:
            continue
    
    if recent_data:
        print(f"\n📈 LETZTE {hours} STUNDEN:")
        for d in recent_data[-10:]:  # Zeige letzte 10 Einträge
            timestamp = datetime.fromisoformat(d['timestamp'].replace('Z', '+00:00'))
            print(f"  {timestamp.strftime('%H:%M:%S')}: {d['power']:.1f}W | {d['temperature']:.1f}°C | {d['status']}")
    else:
        print(f"\n⚠️ KEINE DATEN in den letzten {hours} Stunden")

def main():
    # Standard Log-Verzeichnis
    log_dir = os.path.expanduser("~/.homebridge/logs/kostal-data")
    
    if len(sys.argv) > 1:
        log_dir = sys.argv[1]
    
    if not os.path.exists(log_dir):
        print(f"❌ Log-Verzeichnis nicht gefunden: {log_dir}")
        print("💡 Stelle sicher, dass das Homebridge-Plugin läuft und Daten sammelt")
        return
    
    print(f"🔍 Analysiere Kostal-Daten aus: {log_dir}")
    
    # Lade und analysiere Daten
    data = load_log_data(log_dir)
    analyze_data(data)
    show_recent_data(data)
    
    print(f"\n💡 TIPPS:")
    print(f"  - Logs werden alle 15 Minuten geschrieben")
    print(f"  - Prüfe tagsüber (9-17 Uhr) für Solar-Daten")
    print(f"  - Bei Problemen: Debug-Modus im Plugin aktivieren")

if __name__ == "__main__":
    main()

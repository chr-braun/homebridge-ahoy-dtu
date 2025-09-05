#!/usr/bin/env python3
"""
Kostal Tagesreport Generator
Erstellt einen täglichen Bericht über die erzeugte Strommenge
mit ressourcenschonender Speicherung und Vergleichswerten
"""

import json
import sys
import os
from datetime import datetime, timedelta
import sqlite3
import argparse
import gzip
import pickle

class DailyEnergyReporter:
    def __init__(self, db_path="kostal_data.db", data_dir="kostal_data"):
        self.db_path = db_path
        self.data_dir = data_dir
        self.init_database()
        self.init_data_directory()
    
    def init_database(self):
        """Erstelle SQLite-Datenbank für Energiedaten mit ressourcenschonender Struktur"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Haupttabelle für tägliche Zusammenfassungen (sparsam)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_summaries (
                date TEXT PRIMARY KEY,
                total_energy_kwh REAL,
                max_power_watts REAL,
                avg_temperature REAL,
                production_hours REAL,
                production_start TEXT,
                production_end TEXT,
                data_points INTEGER,
                file_path TEXT
            )
        ''')
        
        # Index für schnelle Abfragen
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_date ON daily_summaries(date)
        ''')
        
        conn.commit()
        conn.close()
    
    def init_data_directory(self):
        """Erstelle Datenverzeichnis für komprimierte Rohdaten"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def add_data_point(self, data):
        """Füge einen Datenpunkt hinzu (ressourcenschonend)"""
        # Nur alle 5 Minuten speichern (sparsam)
        timestamp = datetime.now()
        if hasattr(self, 'last_save_time'):
            if (timestamp - self.last_save_time).total_seconds() < 300:  # 5 Minuten
                return
        
        self.last_save_time = timestamp
        
        # Daten für aktuellen Tag sammeln
        date_str = timestamp.strftime('%Y-%m-%d')
        file_path = os.path.join(self.data_dir, f"{date_str}.pkl.gz")
        
        # Lade existierende Daten oder erstelle neue Liste
        if os.path.exists(file_path):
            with gzip.open(file_path, 'rb') as f:
                day_data = pickle.load(f)
        else:
            day_data = []
        
        # Füge neuen Datenpunkt hinzu
        day_data.append({
            'timestamp': data.get('timestamp', timestamp.isoformat()),
            'power': data.get('power', 0),
            'energy': data.get('energy', 0),
            'temperature': data.get('temperature', 20),
            'status': data.get('status', 'off'),
            'is_producing': data.get('is_producing', False)
        })
        
        # Speichere komprimiert
        with gzip.open(file_path, 'wb') as f:
            pickle.dump(day_data, f)
    
    def get_daily_data(self, date):
        """Lade Daten für einen bestimmten Tag"""
        date_str = date.strftime('%Y-%m-%d')
        file_path = os.path.join(self.data_dir, f"{date_str}.pkl.gz")
        
        if not os.path.exists(file_path):
            return []
        
        with gzip.open(file_path, 'rb') as f:
            return pickle.load(f)
    
    def generate_daily_report(self, date=None):
        """Generiere Tagesreport für ein bestimmtes Datum mit Vergleichswerten"""
        if date is None:
            date = datetime.now().date()
        
        # Lade Daten für den Tag
        data_points = self.get_daily_data(date)
        
        if not data_points:
            return self.create_empty_report(date)
        
        # Berechne Statistiken
        total_energy = self.calculate_total_energy_from_data(data_points)
        max_power = max(point['power'] for point in data_points)
        avg_temperature = sum(point['temperature'] for point in data_points) / len(data_points)
        
        # Produktionszeiten
        production_times = self.calculate_production_times_from_data(data_points)
        
        # Vergleichswerte berechnen
        comparisons = self.calculate_comparisons(date)
        
        # Erstelle Report
        report = {
            "date": date.isoformat(),
            "total_energy_kwh": round(total_energy, 3),
            "max_power_watts": round(max_power, 1),
            "avg_temperature_celsius": round(avg_temperature, 1),
            "production_hours": round(production_times['total_hours'], 2),
            "production_start": production_times['start_time'],
            "production_end": production_times['end_time'],
            "data_points": len(data_points),
            "status": "SUCCESS" if total_energy > 0 else "NO_PRODUCTION",
            "comparisons": comparisons
        }
        
        # Speichere Zusammenfassung in DB
        self.save_daily_summary(date, report)
        
        return report
    
    def calculate_comparisons(self, date):
        """Berechne Vergleichswerte (vorheriger Tag, Woche, Monat)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        comparisons = {}
        
        # Vorheriger Tag
        prev_day = date - timedelta(days=1)
        cursor.execute('SELECT total_energy_kwh FROM daily_summaries WHERE date = ?', (prev_day.isoformat(),))
        prev_day_result = cursor.fetchone()
        comparisons['previous_day'] = {
            'date': prev_day.isoformat(),
            'energy_kwh': round(prev_day_result[0], 3) if prev_day_result else 0,
            'available': prev_day_result is not None
        }
        
        # Vorherige Woche (7 Tage vorher)
        prev_week = date - timedelta(days=7)
        cursor.execute('SELECT total_energy_kwh FROM daily_summaries WHERE date = ?', (prev_week.isoformat(),))
        prev_week_result = cursor.fetchone()
        comparisons['previous_week'] = {
            'date': prev_week.isoformat(),
            'energy_kwh': round(prev_week_result[0], 3) if prev_week_result else 0,
            'available': prev_week_result is not None
        }
        
        # Vorheriger Monat (30 Tage vorher)
        prev_month = date - timedelta(days=30)
        cursor.execute('SELECT total_energy_kwh FROM daily_summaries WHERE date = ?', (prev_month.isoformat(),))
        prev_month_result = cursor.fetchone()
        comparisons['previous_month'] = {
            'date': prev_month.isoformat(),
            'energy_kwh': round(prev_month_result[0], 3) if prev_month_result else 0,
            'available': prev_month_result is not None
        }
        
        # Wochendurchschnitt (letzte 7 Tage)
        week_start = date - timedelta(days=6)
        cursor.execute('''
            SELECT AVG(total_energy_kwh), COUNT(*) 
            FROM daily_summaries 
            WHERE date BETWEEN ? AND ?
        ''', (week_start.isoformat(), (date - timedelta(days=1)).isoformat()))
        week_avg_result = cursor.fetchone()
        comparisons['week_average'] = {
            'period': f"{week_start.isoformat()} bis {(date - timedelta(days=1)).isoformat()}",
            'avg_energy_kwh': round(week_avg_result[0], 3) if week_avg_result[0] else 0,
            'days_count': week_avg_result[1] if week_avg_result[1] else 0
        }
        
        # Monatsdurchschnitt (letzte 30 Tage)
        month_start = date - timedelta(days=29)
        cursor.execute('''
            SELECT AVG(total_energy_kwh), COUNT(*) 
            FROM daily_summaries 
            WHERE date BETWEEN ? AND ?
        ''', (month_start.isoformat(), (date - timedelta(days=1)).isoformat()))
        month_avg_result = cursor.fetchone()
        comparisons['month_average'] = {
            'period': f"{month_start.isoformat()} bis {(date - timedelta(days=1)).isoformat()}",
            'avg_energy_kwh': round(month_avg_result[0], 3) if month_avg_result[0] else 0,
            'days_count': month_avg_result[1] if month_avg_result[1] else 0
        }
        
        conn.close()
        return comparisons
    
    def save_daily_summary(self, date, report):
        """Speichere Tageszusammenfassung in der Datenbank"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        file_path = os.path.join(self.data_dir, f"{date.strftime('%Y-%m-%d')}.pkl.gz")
        
        cursor.execute('''
            INSERT OR REPLACE INTO daily_summaries 
            (date, total_energy_kwh, max_power_watts, avg_temperature, 
             production_hours, production_start, production_end, data_points, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            date.isoformat(),
            report['total_energy_kwh'],
            report['max_power_watts'],
            report['avg_temperature_celsius'],
            report['production_hours'],
            report['production_start'],
            report['production_end'],
            report['data_points'],
            file_path
        ))
        
        conn.commit()
        conn.close()
    
    def calculate_total_energy_from_data(self, data_points):
        """Berechne Gesamtenergie durch Integration der Leistung über Zeit"""
        if len(data_points) < 2:
            return 0
        
        total_energy = 0
        for i in range(1, len(data_points)):
            prev_time = datetime.fromisoformat(data_points[i-1]['timestamp'])
            curr_time = datetime.fromisoformat(data_points[i]['timestamp'])
            time_diff_hours = (curr_time - prev_time).total_seconds() / 3600
            
            # Durchschnittsleistung zwischen den Punkten
            avg_power = (data_points[i-1]['power'] + data_points[i]['power']) / 2
            
            # Energie = Leistung * Zeit
            energy = avg_power * time_diff_hours / 1000  # W zu kW
            total_energy += energy
        
        return total_energy
    
    def calculate_production_times_from_data(self, data_points):
        """Berechne Produktionszeiten"""
        production_periods = []
        current_start = None
        
        for point in data_points:
            is_producing = point['is_producing']
            timestamp = point['timestamp']
            
            if is_producing and current_start is None:
                current_start = timestamp
            elif not is_producing and current_start is not None:
                production_periods.append((current_start, timestamp))
                current_start = None
        
        # Wenn am Ende des Tages noch produziert wird
        if current_start is not None:
            production_periods.append((current_start, data_points[-1]['timestamp']))
        
        # Berechne Gesamtstunden
        total_hours = 0
        for start, end in production_periods:
            start_dt = datetime.fromisoformat(start)
            end_dt = datetime.fromisoformat(end)
            total_hours += (end_dt - start_dt).total_seconds() / 3600
        
        return {
            'total_hours': total_hours,
            'start_time': production_periods[0][0] if production_periods else None,
            'end_time': production_periods[-1][1] if production_periods else None,
            'periods': len(production_periods)
        }
    
    def create_empty_report(self, date):
        """Erstelle leeren Report wenn keine Daten vorhanden"""
        return {
            "date": date.isoformat(),
            "total_energy_kwh": 0,
            "max_power_watts": 0,
            "avg_temperature_celsius": 0,
            "production_hours": 0,
            "production_start": None,
            "production_end": None,
            "data_points": 0,
            "status": "NO_DATA"
        }
    
    def print_report(self, report):
        """Drucke Report in schöner Formatierung mit Vergleichswerten"""
        print("=" * 70)
        print(f"🌞 KOSTAL SOLAR TAGESREPORT - {report['date']}")
        print("=" * 70)
        
        if report['status'] == 'NO_DATA':
            print("❌ Keine Daten für diesen Tag verfügbar")
            return
        
        if report['status'] == 'NO_PRODUCTION':
            print("⚠️  Keine Stromproduktion an diesem Tag")
            return
        
        # Hauptdaten
        print(f"⚡ Gesamtenergie: {report['total_energy_kwh']:.3f} kWh")
        print(f"🔥 Max. Leistung: {report['max_power_watts']:.1f} W")
        print(f"🌡️  Ø Temperatur: {report['avg_temperature_celsius']:.1f} °C")
        print(f"⏱️  Produktionszeit: {report['production_hours']:.2f} Stunden")
        
        if report['production_start']:
            start_time = datetime.fromisoformat(report['production_start']).strftime("%H:%M")
            end_time = datetime.fromisoformat(report['production_end']).strftime("%H:%M")
            print(f"🌅 Produktionsstart: {start_time}")
            print(f"🌇 Produktionsende: {end_time}")
        
        print(f"📊 Datenpunkte: {report['data_points']}")
        
        # Vergleichswerte
        if 'comparisons' in report:
            print("\n" + "=" * 70)
            print("📈 VERGLEICHSWERTE")
            print("=" * 70)
            
            comp = report['comparisons']
            
            # Vorheriger Tag
            if comp['previous_day']['available']:
                diff = report['total_energy_kwh'] - comp['previous_day']['energy_kwh']
                trend = "📈" if diff > 0 else "📉" if diff < 0 else "➡️"
                print(f"📅 Vorheriger Tag ({comp['previous_day']['date']}): {comp['previous_day']['energy_kwh']:.3f} kWh {trend} {diff:+.3f} kWh")
            else:
                print(f"📅 Vorheriger Tag: Keine Daten verfügbar")
            
            # Vorherige Woche
            if comp['previous_week']['available']:
                diff = report['total_energy_kwh'] - comp['previous_week']['energy_kwh']
                trend = "📈" if diff > 0 else "📉" if diff < 0 else "➡️"
                print(f"📅 Vorherige Woche ({comp['previous_week']['date']}): {comp['previous_week']['energy_kwh']:.3f} kWh {trend} {diff:+.3f} kWh")
            else:
                print(f"📅 Vorherige Woche: Keine Daten verfügbar")
            
            # Wochendurchschnitt
            if comp['week_average']['days_count'] > 0:
                diff = report['total_energy_kwh'] - comp['week_average']['avg_energy_kwh']
                trend = "📈" if diff > 0 else "📉" if diff < 0 else "➡️"
                print(f"📊 Wochendurchschnitt ({comp['week_average']['days_count']} Tage): {comp['week_average']['avg_energy_kwh']:.3f} kWh {trend} {diff:+.3f} kWh")
            else:
                print(f"📊 Wochendurchschnitt: Keine Daten verfügbar")
            
            # Monatsdurchschnitt
            if comp['month_average']['days_count'] > 0:
                diff = report['total_energy_kwh'] - comp['month_average']['avg_energy_kwh']
                trend = "📈" if diff > 0 else "📉" if diff < 0 else "➡️"
                print(f"📊 Monatsdurchschnitt ({comp['month_average']['days_count']} Tage): {comp['month_average']['avg_energy_kwh']:.3f} kWh {trend} {diff:+.3f} kWh")
            else:
                print(f"📊 Monatsdurchschnitt: Keine Daten verfügbar")
        
        print("=" * 70)

def main():
    parser = argparse.ArgumentParser(description='Kostal Tagesreport Generator')
    parser.add_argument('--date', help='Datum für Report (YYYY-MM-DD), Standard: heute')
    parser.add_argument('--db', default='kostal_data.db', help='Pfad zur SQLite-Datenbank')
    parser.add_argument('--json', action='store_true', help='Output als JSON')
    
    args = parser.parse_args()
    
    # Datum parsen
    if args.date:
        try:
            date = datetime.strptime(args.date, '%Y-%m-%d').date()
        except ValueError:
            print("❌ Ungültiges Datum. Verwende YYYY-MM-DD Format")
            sys.exit(1)
    else:
        date = datetime.now().date()
    
    # Reporter erstellen
    reporter = DailyEnergyReporter(args.db)
    
    # Report generieren
    report = reporter.generate_daily_report(date)
    
    # Output
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        reporter.print_report(report)

if __name__ == "__main__":
    main()

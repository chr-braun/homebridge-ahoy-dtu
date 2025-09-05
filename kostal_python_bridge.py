#!/usr/bin/env python3
"""
Kostal Python Bridge für Homebridge Plugin
Wird vom TypeScript-Plugin aufgerufen um Daten abzurufen
"""

import asyncio
import json
import sys
import aiohttp
from pykoplenti import ApiClient

# Konfiguration (wird als JSON über stdin übergeben)
def get_config():
    """Lese Konfiguration von stdin"""
    try:
        config_line = sys.stdin.readline().strip()
        if config_line:
            return json.loads(config_line)
        return None
    except Exception as e:
        print(f"❌ Fehler beim Lesen der Konfiguration: {e}", file=sys.stderr)
        return None

async def fetch_kostal_data(config):
    """Hole Daten vom Kostal Wechselrichter"""
    try:
        # Konfiguration extrahieren
        host = config.get("host", "192.168.178.71")
        port = config.get("port", 80)
        password = config.get("password", "pny6F0y9tC7qXnQ")
        
        # WebSession erstellen
        async with aiohttp.ClientSession() as session:
            # API Client erstellen
            client = ApiClient(host=host, port=port, websession=session)
            
            # Authentifizierung
            await client.login(key=password)
            
            # Erst alle verfügbaren Module und Prozessdaten abrufen
            process_data_ids = await client.get_process_data()
            print(f"📊 Verfügbare Module: {list(process_data_ids.keys())}")
            
            # Daten extrahieren (wie im Homebridge-Plugin)
            extracted_data = {
                "process": {
                    "power": 0.0001,  # Fallback-Wert
                    "energy": 0
                },
                "system": {
                    "temperature": 20,  # Fallback-Wert
                    "status": "off"
                },
                "modules": []
            }
            
            # Wichtige Module abrufen
            important_modules = [
                "devices:local",           # Inverter State
                "devices:local:pv1",       # PV String 1
                "devices:local:pv2",       # PV String 2  
                "devices:local:pv3",       # PV String 3
                "devices:local:ac",        # AC/Netz
                "devices:local:home",      # Hausverbrauch
                "devices:local:battery",   # Batterie
                "scb:statistic:EnergyFlow" # Energiefluss
            ]
            
            # Hole Daten für wichtige Module
            for module_id in important_modules:
                if module_id in process_data_ids:
                    try:
                        # Hole alle Prozessdaten für dieses Modul
                        module_data = await client.get_process_data_values(module_id)
                        
                        if module_id in module_data:
                            process_data_collection = module_data[module_id]
                            
                            # Konvertiere zu unserem Format
                            process_data_list = []
                            for data_id, data_value in process_data_collection.items():
                                process_data_list.append({
                                    "id": data_id,
                                    "value": data_value.value if hasattr(data_value, 'value') else data_value,
                                    "unit": data_value.unit if hasattr(data_value, 'unit') else ""
                                })
                            
                            module_info = {
                                "moduleid": module_id,
                                "processdata": process_data_list
                            }
                            extracted_data["modules"].append(module_info)
                            
                            # Extrahiere wichtige Werte
                            if module_id == "devices:local":
                                for data_point in process_data_list:
                                    if data_point.get("id") == "Inverter:State":
                                        state_value = data_point.get("value", 0)
                                        extracted_data["system"]["status"] = "running" if state_value > 0 else "off"
                                    elif data_point.get("id") == "Temperature":
                                        extracted_data["system"]["temperature"] = data_point.get("value", 20)
                            
                            # PV-Leistung sammeln
                            elif module_id.startswith("devices:local:pv"):
                                for data_point in process_data_list:
                                    if data_point.get("id") == "Power":
                                        pv_power = data_point.get("value", 0)
                                        extracted_data["process"]["power"] += pv_power
                            
                            # Hausverbrauch
                            elif module_id == "devices:local:home":
                                for data_point in process_data_list:
                                    if data_point.get("id") == "Power":
                                        home_power = data_point.get("value", 0)
                                        # Hausverbrauch wird von der Gesamtleistung abgezogen
                                        extracted_data["process"]["power"] -= home_power
                        
                    except Exception as e:
                        print(f"⚠️ Fehler beim Abrufen von {module_id}: {e}")
                        continue
            
            # Logout
            await client.logout()
            
            return extracted_data
            
    except Exception as e:
        return {
            "error": str(e),
            "process": {"power": 0, "energy": 0},
            "system": {"temperature": 20, "status": "off"},
            "modules": []
        }

async def main():
    """Hauptfunktion"""
    # Konfiguration lesen
    config = get_config()
    if not config:
        print(json.dumps({"error": "Keine Konfiguration erhalten"}))
        return
    
    # Daten abrufen
    data = await fetch_kostal_data(config)
    
    # Ergebnis als JSON ausgeben
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    asyncio.run(main())

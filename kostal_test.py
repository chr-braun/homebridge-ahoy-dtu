#!/usr/bin/env python3
"""
Kostal Plenticore Python Test Script
Verwendet pykoplenti für die gleichen Daten wie das Homebridge-Plugin
"""

import asyncio
import json
import aiohttp
from pykoplenti import ApiClient

# Konfiguration (aus Homebridge config.json)
HOST = "192.168.178.71"
PORT = 80
USERNAME = "kostal"
PASSWORD = "pny6F0y9tC7qXnQ"

async def get_kostal_data():
    """Hole Daten vom Kostal Wechselrichter"""
    try:
        # WebSession erstellen
        async with aiohttp.ClientSession() as session:
            # API Client erstellen
            client = ApiClient(host=HOST, port=PORT, websession=session)
            
            # Authentifizierung (pykoplenti verwendet key statt username/password)
            await client.login(key=PASSWORD)
            print("✅ Erfolgreich mit Kostal Wechselrichter verbunden")
            
            # Prozessdaten abrufen (wie im Homebridge-Plugin)
            process_data = await client.get_process_data()
            print(f"📊 ProcessData Module: {len(process_data)} Module gefunden")
            
            # Wichtige Daten extrahieren
            extracted_data = {
                "process": {
                    "power": 0.0001,  # Fallback-Wert
                    "energy": 0
                },
                "system": {
                    "temperature": 20,  # Fallback-Wert
                    "status": "off"
                }
            }
            
            # Durchsuche die Prozessdaten nach relevanten Werten
            print("🔍 Verfügbare Module:")
            for module in process_data:
                print(f"  - {module}")
                
                # Prüfe ob es ein Dictionary ist
                if isinstance(module, dict):
                    module_id = module.get("moduleid", "")
                    process_data_list = module.get("processdata", [])
                    
                    print(f"🔍 Modul: {module_id}")
                    
                    # Inverter State (wie im Homebridge-Plugin)
                    if module_id == "devices:local":
                        for data_point in process_data_list:
                            if data_point.get("id") == "Inverter:State":
                                state_value = data_point.get("value", 0)
                                print(f"🏠 Inverter State: {state_value}")
                                extracted_data["system"]["status"] = "running" if state_value > 0 else "off"
                
                # Weitere Datenpunkte können hier hinzugefügt werden
                # PV, AC, Battery, Home, etc.
            
            # Kompakte Anzeige (wie im Homebridge-Plugin)
            power = extracted_data["process"]["power"]
            energy = extracted_data["process"]["energy"]
            temp = extracted_data["system"]["temperature"]
            status = extracted_data["system"]["status"]
            
            print(f"📊 KOSTAL STATUS: {power:.1f}W | {energy:.1f}kWh | {temp:.1f}°C | {status.upper()}")
            
            # Vollständige Daten ausgeben
            print("📋 Vollständige Daten:")
            print(json.dumps(extracted_data, indent=2))
            
            # Logout
            await client.logout()
            print("✅ Verbindung geschlossen")
            
            return extracted_data
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
        return None

async def main():
    """Hauptfunktion"""
    print("🔄 Starte Kostal Daten-Abruf...")
    print(f"🔗 Verbinde zu: {HOST}:{PORT}")
    
    data = await get_kostal_data()
    
    if data:
        print("✅ Daten erfolgreich abgerufen!")
    else:
        print("❌ Fehler beim Abrufen der Daten")

if __name__ == "__main__":
    asyncio.run(main())

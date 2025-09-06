#!/bin/bash
# Kostal Child Bridge Startskript
# Startet das Kostal Plugin als separate Child Bridge

# Wechsle ins Plugin-Verzeichnis
cd "$(dirname "$0")"

# Prüfe ob Node.js verfügbar ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert!"
    exit 1
fi

# Prüfe ob Homebridge verfügbar ist
if ! command -v homebridge &> /dev/null; then
    echo "❌ Homebridge ist nicht installiert!"
    exit 1
fi

# Child Bridge Konfigurationsdatei
CHILD_BRIDGE_CONFIG="$HOME/.homebridge/kostal-child-bridge.json"

# Prüfe ob Child Bridge Konfiguration existiert
if [ ! -f "$CHILD_BRIDGE_CONFIG" ]; then
    echo "❌ Child Bridge Konfiguration nicht gefunden: $CHILD_BRIDGE_CONFIG"
    echo "ℹ️  Starte zuerst das Haupt-Plugin mit Child Bridge aktiviert"
    exit 1
fi

echo "🔗 Starte Kostal Child Bridge..."
echo "📁 Konfiguration: $CHILD_BRIDGE_CONFIG"

# Starte Child Bridge
homebridge -U "$HOME/.homebridge" -C "$CHILD_BRIDGE_CONFIG" -D

echo "✅ Child Bridge gestoppt"

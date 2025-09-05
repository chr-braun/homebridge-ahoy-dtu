#!/bin/bash
# Kostal Tagesreport Script
# Führt den Tagesreport aus und sendet Push-Benachrichtigungen

# Wechsle ins Plugin-Verzeichnis
cd "$(dirname "$0")"

# Führe Tagesreport aus
echo "🌞 Generiere Kostal Tagesreport für $(date +%Y-%m-%d)..."

# Führe den Report aus
node generate-daily-report.js

# Sende Push-Benachrichtigungen (falls konfiguriert)
echo "📱 Prüfe Push-Benachrichtigungen..."
if [ -f "$HOME/.homebridge/kostal-push-config.json" ]; then
    # Prüfe ob Push-Benachrichtigungen aktiviert sind
    if grep -q '"enabled": true' "$HOME/.homebridge/kostal-push-config.json"; then
        echo "📤 Sende Push-Benachrichtigungen..."
        node push-notifications.js --test
    else
        echo "ℹ️  Push-Benachrichtigungen deaktiviert"
    fi
else
    echo "ℹ️  Keine Push-Konfiguration gefunden"
fi

# Legacy: E-Mail senden (falls konfiguriert)
if [ ! -z "$KOSTAL_EMAIL" ]; then
    echo "📧 Sende Report per E-Mail..."
    node generate-daily-report.js --json | mail -s "Kostal Solar Report $(date +%Y-%m-%d)" "$KOSTAL_EMAIL"
fi

echo "✅ Tagesreport abgeschlossen!"

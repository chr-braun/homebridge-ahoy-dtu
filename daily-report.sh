#!/bin/bash
# Kostal Tagesreport Script
# Führt den Tagesreport aus und sendet ihn per E-Mail (optional)

# Wechsle ins Plugin-Verzeichnis
cd "$(dirname "$0")"

# Führe Tagesreport aus
echo "🌞 Generiere Kostal Tagesreport für $(date +%Y-%m-%d)..."

# Führe den Report aus
node generate-daily-report.js

# Optional: E-Mail senden (falls konfiguriert)
if [ ! -z "$KOSTAL_EMAIL" ]; then
    echo "📧 Sende Report per E-Mail..."
    node generate-daily-report.js --json | mail -s "Kostal Solar Report $(date +%Y-%m-%d)" "$KOSTAL_EMAIL"
fi

echo "✅ Tagesreport abgeschlossen!"

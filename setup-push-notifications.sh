#!/bin/bash
# Setup Script für Push-Benachrichtigungen

echo "📱 Kostal Push-Benachrichtigungen Setup"
echo "======================================"

# Erstelle Konfigurationsdatei
CONFIG_FILE="$HOME/.homebridge/kostal-push-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "🔧 Erstelle Push-Konfigurationsdatei..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "enabled": false,
  "time": "20:00",
  "services": {
    "pushover": {
      "enabled": false,
      "userKey": "",
      "appToken": ""
    },
    "telegram": {
      "enabled": false,
      "botToken": "",
      "chatId": ""
    },
    "webhook": {
      "enabled": false,
      "url": "",
      "method": "POST"
    },
    "email": {
      "enabled": false,
      "smtp": {
        "host": "",
        "port": 587,
        "secure": false,
        "auth": {
          "user": "",
          "pass": ""
        }
      },
      "to": "",
      "from": ""
    }
  }
}
EOF
    echo "✅ Konfigurationsdatei erstellt: $CONFIG_FILE"
else
    echo "ℹ️  Konfigurationsdatei existiert bereits: $CONFIG_FILE"
fi

echo ""
echo "🔧 Setup-Anweisungen:"
echo "====================="
echo ""
echo "1. Bearbeite die Konfigurationsdatei:"
echo "   nano $CONFIG_FILE"
echo ""
echo "2. Aktiviere gewünschte Services:"
echo "   - Setze 'enabled': true für gewünschte Services"
echo "   - Fülle die entsprechenden API-Keys/Credentials aus"
echo ""
echo "3. Verfügbare Services:"
echo "   📱 Pushover: https://pushover.net/"
echo "   💬 Telegram: https://core.telegram.org/bots"
echo "   🔗 Webhook: Beliebige HTTP-Endpoint"
echo "   📧 E-Mail: SMTP-Server"
echo ""
echo "4. Teste die Konfiguration:"
echo "   node push-notifications.js --test"
echo ""
echo "5. Starte den geplanten Service:"
echo "   node push-notifications.js --schedule"
echo ""
echo "6. Für automatischen Start beim Booten, füge zu crontab hinzu:"
echo "   @reboot cd $(pwd) && node push-notifications.js --schedule > /dev/null 2>&1"
echo ""

# Zeige aktuelle Konfiguration
echo "📋 Aktuelle Konfiguration:"
echo "=========================="
if [ -f "$CONFIG_FILE" ]; then
    cat "$CONFIG_FILE" | jq . 2>/dev/null || cat "$CONFIG_FILE"
else
    echo "❌ Konfigurationsdatei nicht gefunden"
fi

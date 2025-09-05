const mqtt = require('mqtt');

const client = mqtt.connect({
  host: '192.168.178.29',
  port: 1883,
  username: 'biber',
  password: '2203801826',
  clientId: 'test-client'
});

client.on('connect', () => {
  console.log('✅ MQTT verbunden');
  
  // Einzelne Topics testen
  const topics = [
    'AHOY-DTU_TOTAL/power',
    'AHOY-DTU_TOTAL/energy_today',
    'AHOY-DTU_TOTAL/temperature',
    'AHOY-DTU_TOTAL/status'
  ];
  
  topics.forEach(topic => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`❌ Fehler beim Abonnieren von ${topic}:`, err);
      } else {
        console.log(`📡 Abonniert: ${topic}`);
      }
    });
  });
});

client.on('message', (topic, message) => {
  console.log(`📨 ${topic}: ${message.toString()}`);
});

client.on('error', (error) => {
  console.error('❌ MQTT-Fehler:', error);
});

// Nach 30 Sekunden beenden
setTimeout(() => {
  console.log('🛑 Test beendet');
  client.end();
  process.exit(0);
}, 30000);

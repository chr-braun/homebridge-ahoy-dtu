// Multi-Language Daily Reports Demo
// This demonstrates how the i18n system works

const { SolarReportI18n } = require('./dist/i18n/index.js');

// Create sample report data
const sampleData = {
  energyKwh: 15.8,
  efficiencyPercent: 79,
  peakPowerKw: 4.2,
  peakTime: new Date('2023-08-23T13:15:00'),
  productionHours: 8.5,
  comparison: {
    percent: 12,
    type: 'yesterday'
  },
  weather: 'sunny'
};

// Test all supported languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'zh', name: '中文' }
];

console.log('🌍 AHOY-DTU Multi-Language Daily Reports Demo\n');
console.log('Sample solar data:');
console.log(`• Energy: ${sampleData.energyKwh} kWh`);
console.log(`• Peak Power: ${sampleData.peakPowerKw} kW at ${sampleData.peakTime.toTimeString().slice(0,5)}`);
console.log(`• Efficiency: ${sampleData.efficiencyPercent}%`);
console.log(`• Comparison: +${sampleData.comparison.percent}% vs yesterday\n`);

languages.forEach(lang => {
  console.log(`\n🌟 ${lang.name} (${lang.code}):`);
  console.log('━'.repeat(50));
  
  const i18n = new SolarReportI18n();
  i18n.setLocale(lang.code);
  
  const report = i18n.generateDailyReport(sampleData);
  console.log(report);
});

console.log('\n✅ Multi-language support successfully integrated!');
console.log('📱 Reports will be delivered via HomeKit Motion Sensor notifications');
console.log('⚙️ Configure language in your Homebridge config.json dailyReports section');
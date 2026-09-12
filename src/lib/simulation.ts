import { prisma } from './prisma';
import { clamp } from './utils';

export type SensorScenario = 'healthy' | 'diseased' | 'dry' | 'wet' | 'nutrient_deficient' | 'offline';

interface ScenarioConfig {
  nitrogen: [number, number];
  phosphorus: [number, number];
  potassium: [number, number];
  ph: [number, number];
  moisture1: [number, number];
  moisture2: [number, number];
  soilTemp: [number, number];
  airTemp: [number, number];
  humidity: [number, number];
  rainfall: [number, number];
  light: [number, number];
  wind: [number, number];
}

const SCENARIO_CONFIGS: Record<SensorScenario, ScenarioConfig> = {
  healthy: {
    nitrogen: [120, 160],
    phosphorus: [40, 70],
    potassium: [100, 150],
    ph: [6.0, 7.0],
    moisture1: [55, 75],
    moisture2: [50, 70],
    soilTemp: [22, 30],
    airTemp: [25, 35],
    humidity: [50, 70],
    rainfall: [0, 15],
    light: [400, 800],
    wind: [2, 12],
  },
  diseased: {
    nitrogen: [60, 100],
    phosphorus: [20, 40],
    potassium: [50, 90],
    ph: [5.0, 5.8],
    moisture1: [65, 85],
    moisture2: [60, 80],
    soilTemp: [28, 35],
    airTemp: [30, 38],
    humidity: [75, 95],
    rainfall: [10, 40],
    light: [200, 500],
    wind: [1, 8],
  },
  dry: {
    nitrogen: [80, 120],
    phosphorus: [30, 50],
    potassium: [70, 110],
    ph: [7.0, 8.0],
    moisture1: [15, 35],
    moisture2: [10, 30],
    soilTemp: [30, 42],
    airTemp: [35, 45],
    humidity: [15, 35],
    rainfall: [0, 0],
    light: [600, 1000],
    wind: [8, 25],
  },
  wet: {
    nitrogen: [100, 140],
    phosphorus: [35, 60],
    potassium: [80, 130],
    ph: [5.5, 6.5],
    moisture1: [85, 98],
    moisture2: [80, 95],
    soilTemp: [18, 24],
    airTemp: [20, 28],
    humidity: [85, 100],
    rainfall: [30, 80],
    light: [100, 300],
    wind: [5, 15],
  },
  nutrient_deficient: {
    nitrogen: [20, 50],
    phosphorus: [8, 20],
    potassium: [25, 50],
    ph: [5.0, 5.5],
    moisture1: [40, 60],
    moisture2: [35, 55],
    soilTemp: [24, 32],
    airTemp: [28, 36],
    humidity: [40, 60],
    rainfall: [0, 10],
    light: [400, 700],
    wind: [3, 10],
  },
  offline: {
    nitrogen: [0, 0],
    phosphorus: [0, 0],
    potassium: [0, 0],
    ph: [0, 0],
    moisture1: [0, 0],
    moisture2: [0, 0],
    soilTemp: [0, 0],
    airTemp: [0, 0],
    humidity: [0, 0],
    rainfall: [0, 0],
    light: [0, 0],
    wind: [0, 0],
  },
};

function randomInRange(min: number, max: number): number {
  if (min === max) return min;
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export async function generateSensorReadings(
  stationId: string,
  scenario: SensorScenario = 'healthy'
) {
  const config = SCENARIO_CONFIGS[scenario];

  const reading = await prisma.sensorReading.create({
    data: {
      stationId,
      nitrogen: scenario !== 'offline' ? randomInRange(...config.nitrogen) : null,
      phosphorus: scenario !== 'offline' ? randomInRange(...config.phosphorus) : null,
      potassium: scenario !== 'offline' ? randomInRange(...config.potassium) : null,
      ph: scenario !== 'offline' ? randomInRange(...config.ph) : null,
      moisture1: scenario !== 'offline' ? randomInRange(...config.moisture1) : null,
      moisture2: scenario !== 'offline' ? randomInRange(...config.moisture2) : null,
      soilTemp: scenario !== 'offline' ? randomInRange(...config.soilTemp) : null,
      airTemp: scenario !== 'offline' ? randomInRange(...config.airTemp) : null,
      humidity: scenario !== 'offline' ? randomInRange(...config.humidity) : null,
      rainfall: scenario !== 'offline' ? randomInRange(...config.rainfall) : null,
      light: scenario !== 'offline' ? randomInRange(...config.light) : null,
      wind: scenario !== 'offline' ? randomInRange(...config.wind) : null,
    },
  });

  return reading;
}

export async function generateAIAnalysis(
  stationId: string,
  cropType: string = 'tomato'
) {
  const cropHealth = randomInRange(
    cropType === 'healthy' ? 75 : 30,
    cropType === 'healthy' ? 95 : 65
  );
  const diseaseRisk = randomInRange(
    cropType === 'diseased' ? 60 : 5,
    cropType === 'diseased' ? 90 : 35
  );
  const ndre = randomInRange(0.2, 0.7);
  const chlorophyllStress = randomInRange(5, 40);
  const waterStress = randomInRange(5, 50);
  const nutrientStress = randomInRange(5, 45);
  const diseaseProbability = randomInRange(5, 70);
  const confidence = randomInRange(0.75, 0.98);

  let stressLevel: string = 'low';
  const avgStress = (chlorophyllStress + waterStress + nutrientStress) / 3;
  if (avgStress > 60) stressLevel = 'critical';
  else if (avgStress > 40) stressLevel = 'high';
  else if (avgStress > 20) stressLevel = 'medium';

  const analysis = await prisma.aIAnalysis.create({
    data: {
      stationId,
      cropHealth,
      diseaseRisk,
      ndre,
      chlorophyllStress,
      waterStress,
      nutrientStress,
      diseaseProbability,
      stressLevel,
      confidence,
      result: JSON.stringify({
        cropType,
        recommendations: [
          {
            title: 'Monitor crop health',
            description: 'Continue regular monitoring of crop conditions',
            priority: 'medium',
            category: 'general',
          },
        ],
      }),
    },
  });

  return analysis;
}

interface AlertInput {
  stationId: string;
  type?: string;
  severity?: string;
}

const ALERT_TYPES = [
  {
    type: 'disease_risk',
    severity: 'warning',
    title: 'High Disease Risk Detected',
    message: 'Environmental conditions favorable for disease. Humidity above 80% and temperature between 25-35°C.',
    action: 'Apply preventive fungicide and improve field ventilation.',
  },
  {
    type: 'soil_moisture_low',
    severity: 'critical',
    title: 'Low Soil Moisture Alert',
    message: 'Soil moisture level dropped below 25%. Crop may experience water stress.',
    action: 'Initiate irrigation immediately. Check drip system for blockages.',
  },
  {
    type: 'nutrient_imbalance',
    severity: 'warning',
    title: 'Nutrient Imbalance Detected',
    message: 'Nitrogen levels below optimal range. Crop may show yellowing of leaves.',
    action: 'Apply urea fertilizer (46-0-0) at 50 kg/ha. Consider foliar spray.',
  },
  {
    type: 'high_temperature',
    severity: 'warning',
    title: 'High Temperature Warning',
    message: 'Air temperature exceeded 40°C. Crop may experience heat stress.',
    action: 'Increase irrigation frequency. Provide shade if possible.',
  },
  {
    type: 'high_humidity',
    severity: 'info',
    title: 'High Humidity Detected',
    message: 'Humidity levels above 85%. Monitor for fungal disease symptoms.',
    action: 'Ensure proper spacing between plants. Monitor for leaf spots.',
  },
  {
    type: 'station_offline',
    severity: 'critical',
    title: 'Station Offline',
    message: 'Station has not sent heartbeat for over 2 hours. Possible power or connectivity issue.',
    action: 'Check station power supply and network connectivity.',
  },
  {
    type: 'low_battery',
    severity: 'warning',
    title: 'Low Battery Warning',
    message: 'Station battery level below 20%. Solar panel may need cleaning.',
    action: 'Clean solar panel. Check battery health. Consider replacement.',
  },
  {
    type: 'sensor_failure',
    severity: 'critical',
    title: 'Sensor Malfunction',
    message: 'One or more sensors returning inconsistent readings. Data may be unreliable.',
    action: 'Inspect sensors. Recalibrate or replace faulty units.',
  },
];

export async function generateAlert(
  stationId: string,
  alertType?: string,
  severityOverride?: string
) {
  const alertTemplate = alertType
    ? ALERT_TYPES.find((a) => a.type === alertType) || ALERT_TYPES[0]
    : ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];

  const alert = await prisma.alert.create({
    data: {
      stationId,
      type: alertTemplate.type,
      severity: severityOverride || alertTemplate.severity,
      title: alertTemplate.title,
      message: alertTemplate.message,
      action: alertTemplate.action,
      status: 'new',
    },
  });

  return alert;
}

export async function generateHeartbeat(stationId: string) {
  const battery = randomInRange(15, 100);
  const solarStatus = battery > 90 ? 'full' : battery > 30 ? 'charging' : 'discharging';
  const sensorsOk = Math.random() > 0.1;
  const uptime = Math.floor(randomInRange(3600, 864000));
  const storageUsed = randomInRange(0.5, 4.5);
  const pendingSync = Math.floor(randomInRange(0, 25));

  const heartbeat = await prisma.deviceHeartbeat.create({
    data: {
      stationId,
      battery,
      solarStatus,
      status: sensorsOk ? 'online' : 'warning',
      sensorsOk,
      uptime,
      storageUsed,
      pendingSync,
    },
  });

  await prisma.station.update({
    where: { id: stationId },
    data: {
      battery,
      solarStatus,
      status: sensorsOk ? 'online' : 'warning',
      lastHeartbeat: new Date(),
    },
  });

  return heartbeat;
}

const VOICE_MESSAGES: Record<string, Record<string, Record<string, string>>> = {
  disease_risk: {
    hindi: {
      message: 'सतर्कता: फसल में रोग का खतरा बढ़ गया है। नमी का स्तर अधिक है। कृपया तुरंत उपाय करें।',
      short: 'रोग का खतरा बढ़ा है',
    },
    kannada: {
      message: 'ಎಚ್ಚರಿಕೆ: ಬೆಳೆಯಲ್ಲಿ ರೋಗದ ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ. ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.',
      short: 'ರೋಗ ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ',
    },
    telugu: {
      message: 'హెచ్చరిక: పంటలో వ్యాధి ప్రమాదం పెరిగింది. తేమ స్థాయి ఎక్కువగా ఉంది. దయచేసి వెంటనే చర్య తీసుకోండి.',
      short: 'వ్యాధి ప్రమాదం పెరిగింది',
    },
  },
  soil_moisture_low: {
    hindi: {
      message: 'सतर्कता: मिट्टी की नमी बहुत कम हो गई है। फसल को पानी की तत्काल आवश्यकता है।',
      short: 'मिट्टी की नमी कम है',
    },
    kannada: {
      message: 'ಎಚ್ಚರಿಕೆ: ಮಣ್ಣಿನ ತೇವಾಂಶ ತುಂಬಾ ಕಡಿಮೆಯಾಗಿದೆ. ಬೆಳೆಗೆ ತಕ್ಷಣ ನೀರಿನ ಅಗತ್ಯವಿದೆ.',
      short: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆ',
    },
    telugu: {
      message: 'హెచ్చరిక: మట్టిలో తేమ చాలా తక్కువగా ఉంది. పంటకు వెంటనే నీరు అవసరం.',
      short: 'మట్టి తేమ తక్కువ',
    },
  },
  nutrient_imbalance: {
    hindi: {
      message: 'सतर्कता: पोषक तत्वों का संतुलन बिगड़ गया है। नाइट्रोजन का स्तर कम है। उर्वरक का छिड़काव करें।',
      short: 'पोषक तत्व असंतुलन',
    },
    kannada: {
      message: 'ಎಚ್ಚರಿಕೆ: ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ ಹದಗೆಟ್ಟಿದೆ. ನೈಟ್ರೋಜನ್ ಮಟ್ಟ ಕಡಿಮೆಯಾಗಿದೆ. ಗೊಬ್ಬರ ಸಿಂಪಡಿಸಿ.',
      short: 'ಪೋಷಕಾಂಶ ಅಸಮತೋಲನ',
    },
    telugu: {
      message: 'హెచ్చరిక: పోషకాల సమతుల్యత దెబ్బతింది. నైట్రోజన్ స్థాయి తక్కువగా ఉంది. ఎరువులు చల్లండి.',
      short: 'పోషకాల అసమతుల్యత',
    },
  },
  high_temperature: {
    hindi: {
      message: 'सतर्कता: तापमान बहुत अधिक है। फसल को गर्मी का तनाव हो सकता है। सिंचाई बढ़ाएं।',
      short: 'अधिक तापमान',
    },
    kannada: {
      message: 'ಎಚ್ಚರಿಕೆ: ತಾಪಮಾನ ತುಂಬಾ ಹೆಚ್ಚಾಗಿದೆ. ಬೆಳೆಗೆ ಉಷ್ಣತೆಯ ಒತ್ತಡ ಉಂಟಾಗಬಹುದು. ನೀರಾವರಿ ಹೆಚ್ಚಿಸಿ.',
      short: 'ಹೆಚ್ಚಿನ ತಾಪಮಾನ',
    },
    telugu: {
      message: 'హెచ్చరిక: ఉష్ణోగ్రత చాలా ఎక్కువగా ఉంది. పంటకు వేడి ఒత్తిడి ఉండవచ్చు. నీటిపారుదల పెంచండి.',
      short: 'అధిక ఉష్ణోగ్రత',
    },
  },
  station_offline: {
    hindi: {
      message: 'चेतावनी: स्टेशन ऑफलाइन है। डेटा प्राप्त नहीं हो रहा है। कृपया जांच करें।',
      short: 'स्टेशन ऑफलाइन',
    },
    kannada: {
      message: 'ಎಚ್ಚರಿಕೆ: ಸ್ಟೇಷನ್ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಡೇಟಾ ಲಭ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.',
      short: 'ಸ್ಟೇಷನ್ ಆಫ್‌ಲೈನ್',
    },
    telugu: {
      message: 'హెచ్చరిక: స్టేషన్ ఆఫ్‌లైన్‌లో ఉంది. డేటా అందడం లేదు. దయచేసి తనిఖీ చేయండి.',
      short: 'స్టేషన్ ఆఫ్‌లైన్',
    },
  },
  low_battery: {
    hindi: {
      message: 'सतर्कता: स्टेशन की बैटरी कम है। सौर पैनल की सफाई करें।',
      short: 'बैटरी कम है',
    },
    kannada: {
      message: 'ಎಚ್ಚರಿಕೆ: ಸ್ಟೇಷನ್ ಬ್ಯಾಟರಿ ಕಡಿಮೆಯಾಗಿದೆ. ಸೋಲಾರ್ ಪ್ಯಾನಲ್ ಸ್ವಚ್ಛಗೊಳಿಸಿ.',
      short: 'ಬ್ಯಾಟರಿ ಕಡಿಮೆ',
    },
    telugu: {
      message: 'హెచ్చరిక: స్టేషన్ బ్యాటరీ తక్కువగా ఉంది. సోలార్ ప్యానెల్ శుభ్రం చేయండి.',
      short: 'బ్యాటరీ తక్కువ',
    },
  },
  sensor_failure: {
    hindi: {
      message: 'चेतावनी: सेंसर में खराबी है। डेटा विश्वसनीय नहीं है। सेंसर की जांच करें।',
      short: 'सेंसर खराब',
    },
    kannada: {
      message: 'ಎಚ್ಚರಿಕೆ: ಸೆನ್ಸರ್‌ನಲ್ಲಿ ದೋಷವಿದೆ. ಡೇಟಾ ವಿಶ್ವಾಸಾರ್ಹವಲ್ಲ. ಸೆನ್ಸರ್ ಪರಿಶೀಲಿಸಿ.',
      short: 'ಸೆನ್ಸರ್ ದೋಷ',
    },
    telugu: {
      message: 'హెచ్చరిక: సెన్సార్‌లో లోపం ఉంది. డేటా నమ్మదగినది కాదు. సెన్సార్ తనిఖీ చేయండి.',
      short: 'సెన్సార్ లోపం',
    },
  },
};

const DEFAULT_VOICE_MESSAGES: Record<string, { message: string; short: string }> = {
  hindi: {
    message: 'सतर्कता: कृपया अपनी फसल की स्थिति जांचें।',
    short: 'फसल की जांच करें',
  },
  kannada: {
    message: 'ಎಚ್ಚರಿಕೆ: ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆಯ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
    short: 'ಬೆಳೆ ಪರಿಶೀಲನೆ',
  },
  telugu: {
    message: 'హెచ్చరిక: దయచేసి మీ పంట పరిస్థితిని తనిఖీ చేయండి.',
    short: 'పంట తనిఖీ',
  },
};

export function getVoiceAlertMessage(
  alert: { type: string },
  language: string = 'hindi'
): string {
  const langMessages = VOICE_MESSAGES[alert.type];
  if (langMessages && langMessages[language]) {
    return langMessages[language].message;
  }
  return DEFAULT_VOICE_MESSAGES[language]?.message || DEFAULT_VOICE_MESSAGES.hindi.message;
}

export function getVoiceAlertShort(
  alert: { type: string },
  language: string = 'hindi'
): string {
  const langMessages = VOICE_MESSAGES[alert.type];
  if (langMessages && langMessages[language]) {
    return langMessages[language].short;
  }
  return DEFAULT_VOICE_MESSAGES[language]?.short || DEFAULT_VOICE_MESSAGES.hindi.short;
}

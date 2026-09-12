import { clamp } from './utils';

export interface CropAnalysisInput {
  imageUrl?: string;
  sensorData?: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    ph?: number;
    moisture1?: number;
    moisture2?: number;
    soilTemp?: number;
    airTemp?: number;
    humidity?: number;
    rainfall?: number;
  };
  cropType?: string;
}

export interface CropAnalysisResult {
  cropHealth: number;
  diseaseRisk: number;
  ndre: number;
  chlorophyllStress: number;
  waterStress: number;
  nutrientStress: number;
  diseaseProbability: number;
  stressLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

const CROP_RANGES: Record<string, { n: [number, number]; p: [number, number]; k: [number, number]; ph: [number, number]; moisture: [number, number] }> = {
  tomato: { n: [120, 180], p: [40, 80], k: [100, 160], ph: [6.0, 7.0], moisture: [60, 80] },
  potato: { n: [100, 160], p: [50, 80], k: [120, 180], ph: [5.0, 6.5], moisture: [65, 85] },
  cotton: { n: [80, 140], p: [30, 60], k: [80, 140], ph: [6.0, 7.5], moisture: [50, 70] },
  rice: { n: [100, 160], p: [30, 60], k: [60, 120], ph: [5.5, 7.0], moisture: [70, 90] },
  wheat: { n: [80, 140], p: [25, 50], k: [60, 100], ph: [6.0, 7.5], moisture: [50, 70] },
};

function deterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function calculateNutrientStress(n: number | undefined, p: number | undefined, k: number | undefined, cropType: string): number {
  const ranges = CROP_RANGES[cropType] || CROP_RANGES.tomato;
  let stress = 0;
  let factors = 0;

  if (n !== undefined) {
    const [min, max] = ranges.n;
    if (n < min) stress += (min - n) / min * 50;
    else if (n > max) stress += (n - max) / max * 30;
    factors++;
  }
  if (p !== undefined) {
    const [min, max] = ranges.p;
    if (p < min) stress += (min - p) / min * 40;
    else if (p > max) stress += (p - max) / max * 25;
    factors++;
  }
  if (k !== undefined) {
    const [min, max] = ranges.k;
    if (k < min) stress += (min - k) / min * 45;
    else if (k > max) stress += (k - max) / max * 20;
    factors++;
  }

  return factors > 0 ? clamp(stress / factors, 0, 100) : 20;
}

function calculateWaterStress(moisture: number | undefined, humidity: number | undefined, rainfall: number | undefined, cropType: string): number {
  const ranges = CROP_RANGES[cropType] || CROP_RANGES.tomato;
  let stress = 0;
  let factors = 0;

  if (moisture !== undefined) {
    const [min, max] = ranges.moisture;
    if (moisture < min) stress += (min - moisture) / min * 60;
    else if (moisture > max) stress += (moisture - max) / (100 - max) * 40;
    factors++;
  }
  if (humidity !== undefined) {
    if (humidity < 30) stress += (30 - humidity) / 30 * 30;
    else if (humidity > 85) stress += (humidity - 85) / 15 * 25;
    factors++;
  }
  if (rainfall !== undefined) {
    if (rainfall < 2) stress += 20;
    else if (rainfall > 50) stress += 15;
    factors++;
  }

  return factors > 0 ? clamp(stress / factors, 0, 100) : 15;
}

function calculateChlorophyllStress(n: number | undefined, moisture: number | undefined, soilTemp: number | undefined): number {
  let stress = 0;
  let factors = 0;

  if (n !== undefined && n < 80) stress += (80 - n) / 80 * 50;
  if (moisture !== undefined && moisture < 40) stress += (40 - moisture) / 40 * 35;
  if (soilTemp !== undefined) {
    if (soilTemp < 10) stress += (10 - soilTemp) / 10 * 25;
    else if (soilTemp > 40) stress += (soilTemp - 40) / 20 * 20;
  }
  factors = 3;

  return clamp(stress / factors, 0, 100);
}

export function analyzeCrop(data: CropAnalysisInput): CropAnalysisResult {
  const seed = deterministicHash(JSON.stringify(data));
  const rng = seededRandom(seed);
  const cropType = data.cropType || 'tomato';

  const sensorData = data.sensorData || {};
  const { nitrogen, phosphorus, potassium, ph, moisture1, humidity, rainfall, soilTemp } = sensorData;

  const nutrientStress = calculateNutrientStress(nitrogen, phosphorus, potassium, cropType);
  const waterStress = calculateWaterStress(moisture1, humidity, rainfall, cropType);
  const chlorophyllStress = calculateChlorophyllStress(nitrogen, moisture1, soilTemp);

  const nutrientFactor = clamp(nutrientStress * 0.35, 0, 100);
  const waterFactor = clamp(waterStress * 0.30, 0, 100);
  const chlorophyllFactor = clamp(chlorophyllStress * 0.20, 0, 100);
  const noise = clamp(rng() * 10 - 5, -5, 5);

  const cropHealth = clamp(100 - nutrientFactor - waterFactor - chlorophyllFactor + noise, 0, 100);

  const ndre = clamp(0.3 + (cropHealth / 100) * 0.5 + (rng() * 0.1 - 0.05), 0.1, 0.8);

  const humidityFactor = humidity ? (humidity > 80 ? (humidity - 80) / 20 : 0) : 0;
  const tempFactor = soilTemp ? (soilTemp > 30 ? (soilTemp - 30) / 10 : 0) : 0;
  const diseaseProbability = clamp(
    humidityFactor * 40 + tempFactor * 30 + (100 - cropHealth) * 0.2 + rng() * 10,
    0, 100
  );

  const diseaseRisk = clamp(diseaseProbability * 0.8 + rng() * 5, 0, 100);

  const avgStress = (nutrientStress + waterStress + chlorophyllStress) / 3;
  let stressLevel: CropAnalysisResult['stressLevel'] = 'low';
  if (avgStress > 60) stressLevel = 'critical';
  else if (avgStress > 40) stressLevel = 'high';
  else if (avgStress > 20) stressLevel = 'medium';

  const confidence = clamp(0.75 + rng() * 0.2, 0.7, 0.98);

  return {
    cropHealth: Math.round(cropHealth * 10) / 10,
    diseaseRisk: Math.round(diseaseRisk * 10) / 10,
    ndre: Math.round(ndre * 1000) / 1000,
    chlorophyllStress: Math.round(clamp(chlorophyllStress, 0, 100) * 10) / 10,
    waterStress: Math.round(clamp(waterStress, 0, 100) * 10) / 10,
    nutrientStress: Math.round(clamp(nutrientStress, 0, 100) * 10) / 10,
    diseaseProbability: Math.round(diseaseProbability * 10) / 10,
    stressLevel,
    confidence: Math.round(confidence * 100) / 100,
  };
}

export function calculateCropHealth(readings: {
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  moisture1?: number;
  soilTemp?: number;
  airTemp?: number;
  humidity?: number;
}): number {
  const cropType = 'tomato';
  const nutrientStress = calculateNutrientStress(readings.nitrogen, readings.phosphorus, readings.potassium, cropType);
  const waterStress = calculateWaterStress(readings.moisture1, readings.humidity, undefined, cropType);
  const chlorophyllStress = calculateChlorophyllStress(readings.nitrogen, readings.moisture1, readings.soilTemp);

  const health = 100 - nutrientStress * 0.35 - waterStress * 0.30 - chlorophyllStress * 0.20;
  return Math.round(clamp(health, 0, 100) * 10) / 10;
}

export function calculateDiseaseRisk(data: {
  humidity?: number;
  soilTemp?: number;
  airTemp?: number;
  cropHealth?: number;
}): number {
  const humidityFactor = data.humidity ? (data.humidity > 80 ? (data.humidity - 80) / 20 : 0) : 0;
  const tempFactor = data.soilTemp ? (data.soilTemp > 30 ? (data.soilTemp - 30) / 10 : 0) : 0;
  const healthFactor = data.cropHealth ? (100 - data.cropHealth) / 100 : 0.3;

  return Math.round(clamp(
    humidityFactor * 40 + tempFactor * 30 + healthFactor * 30,
    0, 100
  ) * 10) / 10;
}

export function getRecommendations(analysis: CropAnalysisResult): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (analysis.nutrientStress > 30) {
    recommendations.push({
      title: 'Nutrient Deficiency Detected',
      description: analysis.nutrientStress > 60
        ? 'Critical nutrient deficiency. Apply balanced NPK fertilizer (120:60:60 kg/ha) immediately. Consider foliar spray for quick recovery.'
        : 'Moderate nutrient stress. Apply recommended NPK fertilizer based on soil test. Consider organic manure application.',
      priority: analysis.nutrientStress > 60 ? 'high' : 'medium',
      category: 'nutrient',
    });
  }

  if (analysis.waterStress > 25) {
    recommendations.push({
      title: 'Water Management Required',
      description: analysis.waterStress > 50
        ? 'Severe water stress detected. Initiate irrigation immediately. Check drip system for blockages. Maintain soil moisture at optimal level.'
        : 'Mild water stress. Schedule irrigation based on crop water requirement. Monitor soil moisture regularly.',
      priority: analysis.waterStress > 50 ? 'high' : 'medium',
      category: 'water',
    });
  }

  if (analysis.diseaseProbability > 40) {
    recommendations.push({
      title: 'Disease Risk Alert',
      description: analysis.diseaseProbability > 70
        ? 'High disease probability. Scout field for symptoms. Apply preventive fungicide (Mancozeb 75% WP @ 2g/L). Remove infected plant parts.'
        : 'Moderate disease risk. Monitor crop closely. Ensure proper spacing and ventilation. Apply preventive measures.',
      priority: analysis.diseaseProbability > 70 ? 'high' : 'medium',
      category: 'disease',
    });
  }

  if (analysis.chlorophyllStress > 20) {
    recommendations.push({
      title: 'Chlorophyll Stress Observed',
      description: 'Chlorophyll levels below optimal. Check for nitrogen deficiency or temperature stress. Consider foliar application of urea (2%) or iron chelate.',
      priority: 'medium',
      category: 'nutrient',
    });
  }

  if (analysis.cropHealth >= 75) {
    recommendations.push({
      title: 'Crop Health is Good',
      description: 'Current practices are working well. Continue regular monitoring and maintain current irrigation and fertilization schedule.',
      priority: 'low',
      category: 'general',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Routine Monitoring',
      description: 'No critical issues detected. Continue regular field monitoring and maintain standard care practices.',
      priority: 'low',
      category: 'general',
    });
  }

  return recommendations;
}

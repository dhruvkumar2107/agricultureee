import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  generateSensorReadings,
  generateAIAnalysis,
  generateAlert,
  generateHeartbeat,
  type SensorScenario,
} from '@/lib/simulation';
import { analyzeCrop, getRecommendations } from '@/lib/ai-service';
import { addToSyncQueue } from '@/lib/sync';

const VALID_ACTIONS = [
  'healthy',
  'diseased',
  'dry',
  'wet',
  'nutrient_deficient',
  'offline',
  'low_battery',
] as const;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, stationId } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    let station;
    if (stationId) {
      station = await prisma.station.findFirst({ where: { stationId } });
    } else {
      station = await prisma.station.findFirst();
    }

    if (!station) {
      return NextResponse.json(
        { success: false, error: 'No stations found' },
        { status: 404 }
      );
    }

    const scenario = action as SensorScenario;
    const results: Record<string, unknown> = {};

    if (action === 'offline') {
      await prisma.station.update({
        where: { id: station.id },
        data: { status: 'offline', lastHeartbeat: null },
      });

      const alert = await generateAlert(station.id, 'station_offline', 'critical');
      results.alert = alert;
      results.station = { id: station.id, stationId: station.stationId, status: 'offline' };
    } else if (action === 'low_battery') {
      const heartbeat = await generateHeartbeat(station.id);
      await prisma.station.update({
        where: { id: station.id },
        data: { battery: 15, status: 'warning' },
      });

      const alert = await generateAlert(station.id, 'low_battery', 'warning');
      results.heartbeat = heartbeat;
      results.alert = alert;
      results.reading = await generateSensorReadings(station.id, 'healthy');
    } else {
      const reading = await generateSensorReadings(station.id, scenario);

      const analysisResult = analyzeCrop({
        sensorData: {
          nitrogen: reading.nitrogen ?? undefined,
          phosphorus: reading.phosphorus ?? undefined,
          potassium: reading.potassium ?? undefined,
          ph: reading.ph ?? undefined,
          moisture1: reading.moisture1 ?? undefined,
          soilTemp: reading.soilTemp ?? undefined,
          airTemp: reading.airTemp ?? undefined,
          humidity: reading.humidity ?? undefined,
          rainfall: reading.rainfall ?? undefined,
        },
      });

      const analysis = await prisma.aIAnalysis.create({
        data: {
          stationId: station.id,
          cropHealth: analysisResult.cropHealth,
          diseaseRisk: analysisResult.diseaseRisk,
          ndre: analysisResult.ndre,
          chlorophyllStress: analysisResult.chlorophyllStress,
          waterStress: analysisResult.waterStress,
          nutrientStress: analysisResult.nutrientStress,
          diseaseProbability: analysisResult.diseaseProbability,
          stressLevel: analysisResult.stressLevel,
          confidence: analysisResult.confidence,
          result: JSON.stringify(analysisResult),
        },
      });

      await addToSyncQueue(station.id, 'reading', {
        nitrogen: reading.nitrogen,
        phosphorus: reading.phosphorus,
        potassium: reading.potassium,
        ph: reading.ph,
        moisture1: reading.moisture1,
        moisture2: reading.moisture2,
        soilTemp: reading.soilTemp,
        airTemp: reading.airTemp,
        humidity: reading.humidity,
        rainfall: reading.rainfall,
        light: reading.light,
        wind: reading.wind,
      });

      await addToSyncQueue(station.id, 'analysis', {
        cropHealth: analysisResult.cropHealth,
        diseaseRisk: analysisResult.diseaseRisk,
        stressLevel: analysisResult.stressLevel,
        result: JSON.stringify(analysisResult),
      });

      const shouldAlert =
        analysisResult.diseaseProbability > 60 ||
        analysisResult.nutrientStress > 50 ||
        analysisResult.waterStress > 50;

      let alert = null;
      if (shouldAlert) {
        if (analysisResult.nutrientStress > 50) {
          alert = await generateAlert(station.id, 'nutrient_imbalance', 'warning');
        } else if (analysisResult.waterStress > 50) {
          alert = await generateAlert(station.id, 'soil_moisture_low', 'critical');
        } else {
          alert = await generateAlert(station.id, 'disease_risk', 'warning');
        }
      }

      const recommendations = getRecommendations(analysisResult);

      results.reading = reading;
      results.analysis = analysis;
      results.alert = alert;
      results.recommendations = recommendations;
    }

    results.station = {
      id: station.id,
      stationId: station.stationId,
      name: station.name,
    };

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

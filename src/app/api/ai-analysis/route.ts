import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeCrop, getRecommendations } from '@/lib/ai-service';
import { addToSyncQueue } from '@/lib/sync';

const DEVICE_KEY = process.env.DEVICE_API_KEY || 'agrisentinel-device-key-2024';

export async function POST(request: NextRequest) {
  try {
    const deviceKey = request.headers.get('x-device-key');
    if (deviceKey !== DEVICE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid device key' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { stationId, fieldId, cropId, imageUrl } = body;

    if (!stationId) {
      return NextResponse.json(
        { success: false, error: 'stationId is required' },
        { status: 400 }
      );
    }

    const station = await prisma.station.findFirst({ where: { stationId } });
    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    const latestReading = await prisma.sensorReading.findFirst({
      where: { stationId: station.id },
      orderBy: { timestamp: 'desc' },
    });

    const result = analyzeCrop({
      imageUrl,
      sensorData: latestReading
        ? {
            nitrogen: latestReading.nitrogen ?? undefined,
            phosphorus: latestReading.phosphorus ?? undefined,
            potassium: latestReading.potassium ?? undefined,
            ph: latestReading.ph ?? undefined,
            moisture1: latestReading.moisture1 ?? undefined,
            moisture2: latestReading.moisture2 ?? undefined,
            soilTemp: latestReading.soilTemp ?? undefined,
            airTemp: latestReading.airTemp ?? undefined,
            humidity: latestReading.humidity ?? undefined,
            rainfall: latestReading.rainfall ?? undefined,
          }
        : undefined,
    });

    const analysis = await prisma.aIAnalysis.create({
      data: {
        stationId: station.id,
        fieldId: fieldId || null,
        cropId: cropId || null,
        cropHealth: result.cropHealth,
        diseaseRisk: result.diseaseRisk,
        ndre: result.ndre,
        chlorophyllStress: result.chlorophyllStress,
        waterStress: result.waterStress,
        nutrientStress: result.nutrientStress,
        diseaseProbability: result.diseaseProbability,
        stressLevel: result.stressLevel,
        confidence: result.confidence,
        imageUrl: imageUrl || null,
        result: JSON.stringify(result),
      },
    });

    await addToSyncQueue(station.id, 'analysis', {
      fieldId,
      cropId,
      cropHealth: result.cropHealth,
      diseaseRisk: result.diseaseRisk,
      ndre: result.ndre,
      chlorophyllStress: result.chlorophyllStress,
      waterStress: result.waterStress,
      nutrientStress: result.nutrientStress,
      diseaseProbability: result.diseaseProbability,
      stressLevel: result.stressLevel,
      confidence: result.confidence,
      imageUrl,
      result: JSON.stringify(result),
    });

    const shouldAlert =
      result.diseaseProbability > 60 ||
      result.nutrientStress > 50 ||
      result.waterStress > 50;

    if (shouldAlert) {
      let alertType = 'disease_risk';
      let severity = 'warning';
      let title = 'High Disease Risk Detected';
      let message = `Disease probability: ${result.diseaseProbability}%. Environmental conditions may favor disease development.`;

      if (result.nutrientStress > 50) {
        alertType = 'nutrient_imbalance';
        title = 'Nutrient Stress Detected';
        message = `Nutrient stress level: ${result.nutrientStress}%. Consider soil testing and fertilization.`;
      } else if (result.waterStress > 50) {
        alertType = 'soil_moisture_low';
        severity = 'critical';
        title = 'Water Stress Detected';
        message = `Water stress level: ${result.waterStress}%. Immediate irrigation recommended.`;
      }

      await prisma.alert.create({
        data: {
          stationId: station.id,
          type: alertType,
          severity,
          title,
          message,
          action: 'Review AI analysis and take corrective action.',
          confidence: result.confidence,
          status: 'new',
        },
      });
    }

    const recommendations = getRecommendations(result);

    return NextResponse.json({
      success: true,
      analysis,
      recommendations,
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

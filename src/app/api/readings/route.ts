import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const { stationId, timestamp, soil, weather } = body;

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

    const reading = await prisma.sensorReading.create({
      data: {
        stationId: station.id,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        nitrogen: soil?.nitrogen ?? null,
        phosphorus: soil?.phosphorus ?? null,
        potassium: soil?.potassium ?? null,
        ph: soil?.ph ?? null,
        moisture1: soil?.moisture1 ?? null,
        moisture2: soil?.moisture2 ?? null,
        soilTemp: soil?.soilTemp ?? null,
        airTemp: weather?.temperature ?? null,
        humidity: weather?.humidity ?? null,
        rainfall: weather?.rainfall ?? null,
        light: weather?.light ?? null,
        wind: weather?.wind ?? null,
      },
    });

    await addToSyncQueue(station.id, 'reading', {
      nitrogen: soil?.nitrogen,
      phosphorus: soil?.phosphorus,
      potassium: soil?.potassium,
      ph: soil?.ph,
      moisture1: soil?.moisture1,
      moisture2: soil?.moisture2,
      soilTemp: soil?.soilTemp,
      airTemp: weather?.temperature,
      humidity: weather?.humidity,
      rainfall: weather?.rainfall,
      light: weather?.light,
      wind: weather?.wind,
    });

    return NextResponse.json({ success: true, readingId: reading.id });
  } catch (error) {
    console.error('Create reading error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

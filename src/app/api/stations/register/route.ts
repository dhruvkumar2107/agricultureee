import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { stationId, name, farmId, firmware } = body;

    if (!stationId || !name) {
      return NextResponse.json(
        { success: false, error: 'stationId and name are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.station.findUnique({
      where: { stationId },
    });

    let station;
    if (existing) {
      station = await prisma.station.update({
        where: { id: existing.id },
        data: {
          name,
          farmId: farmId || existing.farmId,
          firmware: firmware || existing.firmware,
          status: 'online',
          lastHeartbeat: new Date(),
        },
      });
    } else {
      station = await prisma.station.create({
        data: {
          stationId,
          name,
          farmId: farmId || null,
          firmware: firmware || '1.0.0',
          status: 'online',
          lastHeartbeat: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, station });
  } catch (error) {
    console.error('Register station error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

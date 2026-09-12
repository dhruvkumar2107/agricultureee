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
    const { stationId, battery, solarStatus, sensorsOk, uptime, storageUsed, pendingSync } = body;

    if (!stationId) {
      return NextResponse.json(
        { success: false, error: 'stationId is required' },
        { status: 400 }
      );
    }

    const station = await prisma.station.findFirst({
      where: { stationId },
    });

    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    const status = sensorsOk ? 'online' : 'warning';

    await prisma.station.update({
      where: { id: station.id },
      data: {
        battery: battery ?? undefined,
        solarStatus: solarStatus ?? undefined,
        status,
        lastHeartbeat: new Date(),
      },
    });

    await prisma.deviceHeartbeat.create({
      data: {
        stationId: station.id,
        battery: battery ?? null,
        solarStatus: solarStatus ?? null,
        status,
        sensorsOk: sensorsOk ?? true,
        uptime: uptime ?? null,
        storageUsed: storageUsed ?? null,
        pendingSync: pendingSync ?? 0,
      },
    });

    await addToSyncQueue(station.id, 'heartbeat', {
      battery,
      solarStatus,
      status,
      sensorsOk,
      uptime,
      storageUsed,
      pendingSync,
    });

    return NextResponse.json({ success: true, synced: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

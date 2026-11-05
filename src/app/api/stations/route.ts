import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    const where = farmId ? { farmId } : {};

    // Ensure the Firebase ESP32 device station exists
    try {
      const espStation = await prisma.station.findUnique({
        where: { stationId: 'esp32_01' },
      });
      if (!espStation) {
        const firstFarm = await prisma.farm.findFirst();
        await prisma.station.create({
          data: {
            stationId: 'esp32_01',
            name: 'ESP32 Cultivation Node (Firebase RTDB)',
            firmware: 'ESP32-RTDB-1.0',
            status: 'online',
            battery: 100,
            solarStatus: 'charging',
            farmId: firstFarm ? firstFarm.id : null,
            lastHeartbeat: new Date(),
          },
        });
      }
    } catch (e) {
      console.warn('Could not auto-provision esp32_01 station:', e);
    }

    const stations = await prisma.station.findMany({
      where,
      include: {
        farm: { select: { id: true, name: true } },
        _count: { select: { readings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = stations.map((s: (typeof stations)[number]) => ({
      id: s.id,
      stationId: s.stationId,
      name: s.name,
      farmId: s.farmId,
      farm: s.farm,
      firmware: s.firmware,
      status: s.status,
      battery: s.battery,
      solarStatus: s.solarStatus,
      lastHeartbeat: s.lastHeartbeat,
      readingCount: s._count.readings,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ success: true, stations: result });
  } catch (error) {
    console.error('List stations error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    const where = farmId ? { farmId } : {};

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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const station = await prisma.station.findUnique({
      where: { id },
      include: {
        farm: { select: { id: true, name: true } },
        sensors: true,
        readings: { orderBy: { timestamp: 'desc' }, take: 1 },
        alerts: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, station });
  } catch (error) {
    console.error('Get station error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, farmId } = body;

    const existing = await prisma.station.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    const station = await prisma.station.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        farmId: farmId !== undefined ? farmId : existing.farmId,
      },
    });

    return NextResponse.json({ success: true, station });
  } catch (error) {
    console.error('Update station error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.station.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    await prisma.alert.deleteMany({ where: { stationId: id } });
    await prisma.syncQueue.deleteMany({ where: { stationId: id } });
    await prisma.deviceHeartbeat.deleteMany({ where: { stationId: id } });
    await prisma.sensorReading.deleteMany({ where: { stationId: id } });
    await prisma.aIAnalysis.deleteMany({ where: { stationId: id } });
    await prisma.sensor.deleteMany({ where: { stationId: id } });
    await prisma.voiceAlert.deleteMany({ where: { stationId: id } });
    await prisma.station.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete station error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

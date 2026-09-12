import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const station = await prisma.station.findUnique({ where: { id } });
    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    const where: Record<string, unknown> = { stationId: id };
    if (from || to) {
      where.timestamp = {};
      if (from) (where.timestamp as Record<string, Date>).gte = new Date(from);
      if (to) (where.timestamp as Record<string, Date>).lte = new Date(to);
    }

    const readings = await prisma.sensorReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 500),
    });

    return NextResponse.json({ success: true, readings });
  } catch (error) {
    console.error('Get readings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

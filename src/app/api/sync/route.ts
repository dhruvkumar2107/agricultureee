import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processSyncQueue } from '@/lib/sync';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');

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

    const pendingItems = await prisma.syncQueue.findMany({
      where: {
        stationId: station.id,
        synced: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      items: pendingItems,
      count: pendingItems.length,
    });
  } catch (error) {
    console.error('Get sync items error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await processSyncQueue();

    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Process sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

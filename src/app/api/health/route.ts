import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || '';
    const hasUrl = url.length > 0;
    const stripped = url.replace(/^["']|["']$/g, '');
    const hasQuotes = url !== stripped;

    const [userCount, stationCount, readingCount] = await Promise.all([
      prisma.user.count(),
      prisma.station.count(),
      prisma.sensorReading.count(),
    ]);

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      hasDatabaseUrl: hasUrl,
      hasQuotes,
      userCount,
      stationCount,
      readingCount,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        error: (error as Error).message,
      },
      { status: 503 }
    );
  }
}

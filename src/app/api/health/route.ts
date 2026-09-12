import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [onlineCount, offlineCount] = await Promise.all([
      prisma.station.count({ where: { status: 'online' } }),
      prisma.station.count({ where: { status: { not: 'online' } } }),
    ]);

    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
      stations: {
        online: onlineCount,
        offline: offlineCount,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        db: 'disconnected',
        stations: { online: 0, offline: 0 },
      },
      { status: 503 }
    );
  }
}

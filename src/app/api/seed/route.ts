import { NextResponse } from 'next/server';
import { ensureSeed } from '@/lib/ensure-seed';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    await ensureSeed();
    const count = await prisma.user.count();
    return NextResponse.json({ success: true, message: 'Database seeded', userCount: count });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Seed failed: ' + (error as Error).message }, { status: 500 });
  }
}

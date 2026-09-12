import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const farms = await prisma.farm.findMany({
      where: { ownerId: user.id },
      include: {
        fields: {
          include: {
            crops: true,
          },
        },
        stations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, farms });
  } catch (error) {
    console.error('List farms error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, location, latitude, longitude, acreage } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Farm name is required' },
        { status: 400 }
      );
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        location: location || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        acreage: acreage ?? null,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ success: true, farm }, { status: 201 });
  } catch (error) {
    console.error('Create farm error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

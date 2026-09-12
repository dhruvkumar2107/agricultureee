import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
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

    const farm = await prisma.farm.findUnique({
      where: { id },
      include: {
        fields: {
          include: { crops: true },
        },
        stations: true,
      },
    });

    if (!farm) {
      return NextResponse.json(
        { success: false, error: 'Farm not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, farm });
  } catch (error) {
    console.error('Get farm error:', error);
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
    const { name, location, latitude, longitude, acreage } = body;

    const existing = await prisma.farm.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Farm not found' },
        { status: 404 }
      );
    }

    if (existing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const farm = await prisma.farm.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        location: location !== undefined ? location : existing.location,
        latitude: latitude !== undefined ? latitude : existing.latitude,
        longitude: longitude !== undefined ? longitude : existing.longitude,
        acreage: acreage !== undefined ? acreage : existing.acreage,
      },
    });

    return NextResponse.json({ success: true, farm });
  } catch (error) {
    console.error('Update farm error:', error);
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

    const existing = await prisma.farm.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Farm not found' },
        { status: 404 }
      );
    }

    if (existing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.field.deleteMany({ where: { farmId: id } });
    await prisma.station.updateMany({ where: { farmId: id }, data: { farmId: null } });
    await prisma.farm.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete farm error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

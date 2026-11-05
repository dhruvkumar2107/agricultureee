import { NextRequest, NextResponse } from "next/server";
import { fetchFirebaseLatest, firebaseConfig } from "@/lib/firebase";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId") || "esp32_01";

    const data = await fetchFirebaseLatest(deviceId);

    // Also fetch available devices if possible
    let devices: string[] = [deviceId];
    try {
      const devRes = await fetch(`${firebaseConfig.databaseURL}/devices.json?shallow=true`);
      if (devRes.ok) {
        const devObj = await devRes.json();
        if (devObj && typeof devObj === "object") {
          devices = Object.keys(devObj);
        }
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      deviceId,
      devices,
      data,
    });
  } catch (error: any) {
    console.error("Firebase API GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch from Firebase" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const deviceId = body.deviceId || "esp32_01";

    const data = await fetchFirebaseLatest(deviceId);
    if (!data) {
      return NextResponse.json(
        { success: false, error: "No data available in Firebase for this device" },
        { status: 404 }
      );
    }

    // Ensure the station exists in our Prisma DB
    let station = await prisma.station.findFirst({
      where: { stationId: deviceId },
    });

    if (!station) {
      // Link to first farm if available
      const farm = await prisma.farm.findFirst();
      station = await prisma.station.create({
        data: {
          stationId: deviceId,
          name: "ESP32 Cultivation IoT Node",
          firmware: "ESP32-RTDB-v1.0",
          status: "online",
          battery: 98,
          solarStatus: "charging",
          farmId: farm ? farm.id : null,
          lastHeartbeat: new Date(),
        },
      });
    } else {
      station = await prisma.station.update({
        where: { id: station.id },
        data: {
          status: "online",
          lastHeartbeat: new Date(),
        },
      });
    }

    // Convert timestamp
    const readingTime = data.timestamp
      ? (data.timestamp > 10000000000 ? new Date(data.timestamp) : new Date(data.timestamp * 1000))
      : new Date();

    const reading = await prisma.sensorReading.create({
      data: {
        stationId: station.id,
        timestamp: isNaN(readingTime.getTime()) ? new Date() : readingTime,
        nitrogen: data.nitrogen ?? null,
        phosphorus: data.phosphorus ?? null,
        potassium: data.potassium ?? null,
        ph: data.ph ?? null,
        moisture1: data.moisture ?? null,
        raw: JSON.stringify({
          source: "firebase-rtdb",
          moistureRaw: data.moistureRaw,
          phVoltage: data.phVoltage,
          npkValid: data.npkValid,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Synced Firebase data to database successfully",
      station,
      reading,
    });
  } catch (error: any) {
    console.error("Firebase API POST error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to sync Firebase data" },
      { status: 500 }
    );
  }
}


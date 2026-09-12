import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ success: true, message: 'Database already seeded', userCount: existingUsers });
    }

    const password = await bcrypt.hash('password123', 12);

    const admin = await prisma.user.create({
      data: { email: 'admin@agrisentinel.com', name: 'Admin User', password, role: 'admin' },
    });
    const farmer = await prisma.user.create({
      data: { email: 'farmer@demo.com', name: 'Ramesh Kumar', password, role: 'farmer' },
    });
    const fpo = await prisma.user.create({
      data: { email: 'fpo@demo.com', name: 'FPO Manager', password, role: 'fpo' },
    });

    const farm1 = await prisma.farm.create({
      data: { name: 'Nashik Farm', location: 'Nashik, Maharashtra', latitude: 19.9975, longitude: 73.7898, acreage: 50, ownerId: farmer.id },
    });
    const farm2 = await prisma.farm.create({
      data: { name: 'Mysore Farm', location: 'Mysore, Karnataka', latitude: 12.2958, longitude: 76.6394, acreage: 35, ownerId: farmer.id },
    });
    const farm3 = await prisma.farm.create({
      data: { name: 'Hyderabad Farm', location: 'Hyderabad, Telangana', latitude: 17.385, longitude: 78.4867, acreage: 40, ownerId: fpo.id },
    });

    const field1 = await prisma.field.create({ data: { name: 'Tomato Field', farmId: farm1.id, area: 15, cropType: 'Tomato' } });
    const field2 = await prisma.field.create({ data: { name: 'Potato Field', farmId: farm1.id, area: 12, cropType: 'Potato' } });
    const field3 = await prisma.field.create({ data: { name: 'Cotton Field', farmId: farm2.id, area: 20, cropType: 'Cotton' } });
    const field4 = await prisma.field.create({ data: { name: 'Rice Field', farmId: farm3.id, area: 25, cropType: 'Rice' } });

    await prisma.crop.create({ data: { name: 'Tomato', fieldId: field1.id, variety: 'Roma', stage: 'fruiting', status: 'healthy' } });
    await prisma.crop.create({ data: { name: 'Potato', fieldId: field2.id, variety: 'Kufri', stage: 'vegetative', status: 'healthy' } });
    await prisma.crop.create({ data: { name: 'Cotton', fieldId: field3.id, variety: 'Bt Cotton', stage: 'flowering', status: 'healthy' } });
    await prisma.crop.create({ data: { name: 'Rice', fieldId: field4.id, variety: 'Basmati', stage: 'seedling', status: 'healthy' } });

    const stations = [];
    for (let i = 1; i <= 4; i++) {
      const s = await prisma.station.create({
        data: {
          stationId: `AGR-00${i}`,
          name: `Station ${i}`,
          farmId: i <= 2 ? farm1.id : i <= 3 ? farm2.id : farm3.id,
          firmware: '1.0.0',
          status: i <= 2 ? 'online' : i === 3 ? 'warning' : 'offline',
          battery: i <= 2 ? 85 : i === 3 ? 45 : 15,
          solarStatus: i <= 2 ? 'charging' : 'discharging',
        },
      });
      stations.push(s);

      const sensorTypes = ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Moisture 1', 'Moisture 2', 'Temperature', 'Humidity'];
      await prisma.sensor.createMany({
        data: sensorTypes.map(name => ({
          stationId: s.id,
          type: name.toLowerCase().replace(' ', '_'),
          name,
          unit: name === 'pH' ? 'pH' : name.includes('Moisture') ? '%' : name === 'Temperature' ? '°C' : name === 'Humidity' ? '%' : 'mg/kg',
        })),
      });
    }

    const allReadings = [];
    const now = Date.now();
    for (const station of stations) {
      for (let h = 0; h < 24; h++) {
        allReadings.push({
          stationId: station.id,
          timestamp: new Date(now - h * 60 * 60 * 1000),
          nitrogen: 50 + Math.random() * 30,
          phosphorus: 25 + Math.random() * 20,
          potassium: 80 + Math.random() * 60,
          ph: 6 + Math.random() * 1.5,
          moisture1: 30 + Math.random() * 30,
          moisture2: 25 + Math.random() * 25,
          soilTemp: 20 + Math.random() * 10,
          airTemp: 25 + Math.random() * 12,
          humidity: 50 + Math.random() * 30,
          rainfall: Math.random() > 0.8 ? Math.random() * 10 : 0,
          light: 500 + Math.random() * 500,
          wind: 5 + Math.random() * 15,
        });
      }
    }
    for (let i = 0; i < allReadings.length; i += 50) {
      await prisma.sensorReading.createMany({ data: allReadings.slice(i, i + 50) });
    }

    await prisma.alert.createMany({
      data: [
        { stationId: stations[2].id, type: 'temperature', severity: 'warning', title: 'High Temperature Detected', message: 'Soil temperature exceeding optimal range for cotton.', status: 'new' },
        { stationId: stations[3].id, type: 'offline', severity: 'critical', title: 'Station Offline', message: 'AGR-004 has not sent data in 2 hours.', status: 'new' },
        { stationId: stations[0].id, type: 'moisture', severity: 'info', title: 'Moisture Normal', message: 'Soil moisture levels are within optimal range.', status: 'resolved' },
      ],
    });

    return NextResponse.json({ success: true, message: 'Database seeded successfully', users: 3, farms: 3, stations: 4 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Seed failed: ' + (error as Error).message }, { status: 500 });
  }
}

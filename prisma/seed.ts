import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data in correct order (foreign keys)
  console.log("Cleaning existing data...");
  await prisma.syncQueue.deleteMany();
  await prisma.voiceAlert.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.deviceHeartbeat.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.field.deleteMany();
  await prisma.station.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log("Existing data cleaned.");

  // ============================================================
  // USERS
  // ============================================================
  console.log("Creating users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const farmerPassword = await bcrypt.hash("farmer123", 10);
  const fpoPassword = await bcrypt.hash("fpo123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@agrisentinel.com",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      phone: "+91-9876543210",
    },
  });

  const farmer = await prisma.user.create({
    data: {
      email: "farmer@demo.com",
      name: "Rajesh Kumar",
      password: farmerPassword,
      role: "farmer",
      phone: "+91-9876543211",
    },
  });

  const fpo = await prisma.user.create({
    data: {
      email: "fpo@demo.com",
      name: "Sunita Devi",
      password: fpoPassword,
      role: "fpo",
      phone: "+91-9876543212",
    },
  });
  console.log(`Created ${3} users.`);

  // ============================================================
  // FARMS
  // ============================================================
  console.log("Creating farms...");
  const farm1 = await prisma.farm.create({
    data: {
      name: "Kumar Agricultural Farm",
      location: "Nashik, Maharashtra",
      latitude: 19.9975,
      longitude: 73.7898,
      acreage: 12,
      ownerId: farmer.id,
    },
  });

  const farm2 = await prisma.farm.create({
    data: {
      name: "Devi Progressive Farm",
      location: "Mysore, Karnataka",
      latitude: 12.2958,
      longitude: 76.6394,
      acreage: 8,
      ownerId: fpo.id,
    },
  });

  const farm3 = await prisma.farm.create({
    data: {
      name: "联合示范 Farm",
      location: "Hyderabad, Telangana",
      latitude: 17.385,
      longitude: 78.4867,
      acreage: 25,
      ownerId: admin.id,
    },
  });
  console.log(`Created ${3} farms.`);

  // ============================================================
  // FIELDS
  // ============================================================
  console.log("Creating fields...");
  const field1a = await prisma.field.create({
    data: {
      name: "Tomato Field A",
      farmId: farm1.id,
      area: 3,
      cropType: "tomato",
      latitude: 20.0,
      longitude: 73.79,
    },
  });

  const field1b = await prisma.field.create({
    data: {
      name: "Potato Field B",
      farmId: farm1.id,
      area: 4,
      cropType: "potato",
      latitude: 20.001,
      longitude: 73.788,
    },
  });

  const field1c = await prisma.field.create({
    data: {
      name: "Cotton Field C",
      farmId: farm1.id,
      area: 5,
      cropType: "cotton",
      latitude: 19.995,
      longitude: 73.791,
    },
  });

  const field2a = await prisma.field.create({
    data: {
      name: "Chilli Field A",
      farmId: farm2.id,
      area: 3,
      cropType: "chilli",
      latitude: 12.296,
      longitude: 76.64,
    },
  });

  const field2b = await prisma.field.create({
    data: {
      name: "Rice Paddy B",
      farmId: farm2.id,
      area: 5,
      cropType: "rice",
      latitude: 12.294,
      longitude: 76.638,
    },
  });

  const field3a = await prisma.field.create({
    data: {
      name: "Wheat Field A",
      farmId: farm3.id,
      area: 10,
      cropType: "wheat",
      latitude: 17.386,
      longitude: 78.487,
    },
  });

  const field3b = await prisma.field.create({
    data: {
      name: "Maize Field B",
      farmId: farm3.id,
      area: 15,
      cropType: "maize",
      latitude: 17.384,
      longitude: 78.486,
    },
  });
  console.log(`Created ${7} fields.`);

  // ============================================================
  // STATIONS
  // ============================================================
  console.log("Creating stations...");
  const now = new Date();

  const station1 = await prisma.station.create({
    data: {
      stationId: "AGR-001",
      name: "Nashik Soil Monitor 1",
      farmId: farm1.id,
      firmware: "2.1.0",
      status: "online",
      battery: 92,
      solarStatus: "charging",
      lastHeartbeat: new Date(now.getTime() - 2 * 60000),
    },
  });

  const station2 = await prisma.station.create({
    data: {
      stationId: "AGR-002",
      name: "Nashik Soil Monitor 2",
      farmId: farm1.id,
      firmware: "2.1.0",
      status: "online",
      battery: 78,
      solarStatus: "charging",
      lastHeartbeat: new Date(now.getTime() - 5 * 60000),
    },
  });

  const station3 = await prisma.station.create({
    data: {
      stationId: "AGR-003",
      name: "Nashik Weather Station",
      farmId: farm1.id,
      firmware: "2.0.5",
      status: "online",
      battery: 85,
      solarStatus: "full",
      lastHeartbeat: new Date(now.getTime() - 3 * 60000),
    },
  });

  const station4 = await prisma.station.create({
    data: {
      stationId: "AGR-004",
      name: "Mysore Field Monitor 1",
      farmId: farm2.id,
      firmware: "2.1.0",
      status: "online",
      battery: 65,
      solarStatus: "charging",
      lastHeartbeat: new Date(now.getTime() - 4 * 60000),
    },
  });

  const station5 = await prisma.station.create({
    data: {
      stationId: "AGR-005",
      name: "Mysore Field Monitor 2",
      farmId: farm2.id,
      firmware: "2.0.5",
      status: "warning",
      battery: 45,
      solarStatus: "discharging",
      lastHeartbeat: new Date(now.getTime() - 30 * 60000),
    },
  });

  const station6 = await prisma.station.create({
    data: {
      stationId: "AGR-006",
      name: "Hyderabad Central Monitor",
      farmId: farm3.id,
      firmware: "2.1.0",
      status: "online",
      battery: 98,
      solarStatus: "full",
      lastHeartbeat: new Date(now.getTime() - 1 * 60000),
    },
  });

  const station7 = await prisma.station.create({
    data: {
      stationId: "AGR-007",
      name: "Hyderabad Edge Station",
      farmId: farm3.id,
      firmware: "2.0.3",
      status: "offline",
      battery: 12,
      solarStatus: "error",
      lastHeartbeat: new Date(now.getTime() - 3 * 3600000),
    },
  });

  const station8 = await prisma.station.create({
    data: {
      stationId: "AGR-008",
      name: "Hyderabad Weather Hub",
      farmId: farm3.id,
      firmware: "2.1.0",
      status: "online",
      battery: 76,
      solarStatus: "charging",
      lastHeartbeat: new Date(now.getTime() - 2 * 60000),
    },
  });

  const allStations = [station1, station2, station3, station4, station5, station6, station7, station8];
  console.log(`Created ${allStations.length} stations.`);

  // ============================================================
  // SENSORS (8 per station)
  // ============================================================
  console.log("Creating sensors...");
  const sensorTypes = [
    { type: "nucleus", name: "Nitrogen Sensor", unit: "mg/kg" },
    { type: "phosphorus", name: "Phosphorus Sensor", unit: "mg/kg" },
    { type: "potassium", name: "Potassium Sensor", unit: "mg/kg" },
    { type: "ph", name: "pH Sensor", unit: "pH" },
    { type: "moisture", name: "Moisture Sensor 1", unit: "%" },
    { type: "moisture", name: "Moisture Sensor 2", unit: "%" },
    { type: "temperature", name: "Temperature Sensor", unit: "°C" },
    { type: "humidity", name: "Humidity Sensor", unit: "%" },
  ];

  const allSensors: Awaited<ReturnType<typeof prisma.sensor.create>>[] = [];
  for (const station of allStations) {
    for (const s of sensorTypes) {
      const sensor = await prisma.sensor.create({
        data: {
          stationId: station.id,
          type: s.type,
          name: s.name,
          unit: s.unit,
          status: station.status === "offline" ? "inactive" : "active",
          lastReading: 0,
          lastUpdated: station.status === "offline" ? new Date(now.getTime() - 3600000) : now,
        },
      });
      allSensors.push(sensor);
    }
  }
  console.log(`Created ${allSensors.length} sensors.`);

  // ============================================================
  // CROPS (one per field)
  // ============================================================
  console.log("Creating crops...");
  const crops = [
    { name: "Tomato", fieldId: field1a.id, variety: "Roma", stage: "fruiting", status: "healthy", plantedDate: new Date("2026-06-15"), harvestDate: new Date("2026-10-15") },
    { name: "Potato", fieldId: field1b.id, variety: "Kufri Jyoti", stage: "vegetative", status: "healthy", plantedDate: new Date("2026-07-01"), harvestDate: new Date("2026-11-01") },
    { name: "Cotton", fieldId: field1c.id, variety: "Bt Cotton", stage: "flowering", status: "stressed", plantedDate: new Date("2026-05-20"), harvestDate: new Date("2026-12-01") },
    { name: "Chilli", fieldId: field2a.id, variety: "Guntur", stage: "flowering", status: "healthy", plantedDate: new Date("2026-06-20"), harvestDate: new Date("2026-10-20") },
    { name: "Rice", fieldId: field2b.id, variety: "Sona Masoori", stage: "vegetative", status: "healthy", plantedDate: new Date("2026-07-05"), harvestDate: new Date("2026-11-10") },
    { name: "Wheat", fieldId: field3a.id, variety: "HD-3226", stage: "seedling", status: "healthy", plantedDate: new Date("2026-08-01"), harvestDate: new Date("2026-12-20") },
    { name: "Maize", fieldId: field3b.id, variety: "HQPM-1", stage: "vegetative", status: "diseased", plantedDate: new Date("2026-07-10"), harvestDate: new Date("2026-11-15") },
  ];

  const createdCrops = [];
  for (const c of crops) {
    const crop = await prisma.crop.create({ data: c as any });
    createdCrops.push(crop);
  }
  console.log(`Created ${createdCrops.length} crops.`);

  // ============================================================
  // SENSOR READINGS (30 days, every 15 min for each station)
  // ============================================================
  console.log("Generating sensor readings (this may take a moment)...");
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const interval = 15 * 60 * 1000; // 15 minutes

  function rand(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  function chance(p: number): boolean {
    return Math.random() < p;
  }

  for (const station of allStations) {
    let readingsCreated = 0;
    const batch: any[] = [];
    let ts = new Date(thirtyDaysAgo);

    // Base ranges per station for variety
    const base = {
      nitrogen: rand(50, 100),
      phosphorus: rand(30, 60),
      potassium: rand(40, 80),
      ph: rand(6.0, 7.5),
      moisture1: rand(50, 75),
      moisture2: rand(50, 75),
      soilTemp: rand(22, 30),
      airTemp: rand(25, 38),
      humidity: rand(55, 85),
      rainfall: 0,
      light: rand(400, 900),
      wind: rand(0, 12),
    };

    // For AGR-007 (offline), moisture decreases over time
    const isDecreasing = station.stationId === "AGR-007";
    // For AGR-005 (warning), battery-like moisture drops
    const isWarning = station.stationId === "AGR-005";

    while (ts.getTime() < now.getTime()) {
      // Day-of-year factor for seasonal variation
      const dayFrac = (ts.getTime() - thirtyDaysAgo.getTime()) / (30 * 24 * 60 * 60 * 1000);
      const hour = ts.getHours();

      // Temperature follows daily cycle
      const tempCycle = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 5;

      let moisture1 = base.moisture1 + rand(-8, 8);
      let moisture2 = base.moisture2 + rand(-8, 8);
      if (isDecreasing) {
        moisture1 = Math.max(15, moisture1 - dayFrac * 20 + rand(-3, 3));
        moisture2 = Math.max(15, moisture2 - dayFrac * 18 + rand(-3, 3));
      }
      if (isWarning) {
        moisture1 = Math.max(20, moisture1 - dayFrac * 15 + rand(-5, 5));
        moisture2 = Math.max(20, moisture2 - dayFrac * 12 + rand(-5, 5));
      }

      // Rainfall: mostly 0, occasionally rain
      const rainfall = chance(0.05) ? rand(1, 15) : 0;

      batch.push({
        stationId: station.id,
        timestamp: new Date(ts),
        nitrogen: Math.max(20, Math.min(150, base.nitrogen + rand(-15, 15) + dayFrac * rand(-5, 5))),
        phosphorus: Math.max(10, Math.min(100, base.phosphorus + rand(-10, 10))),
        potassium: Math.max(20, Math.min(120, base.potassium + rand(-12, 12))),
        ph: Math.max(4.5, Math.min(9.0, base.ph + rand(-0.5, 0.5))),
        moisture1: Math.max(10, Math.min(98, moisture1)),
        moisture2: Math.max(10, Math.min(98, moisture2)),
        soilTemp: Math.max(12, Math.min(45, base.soilTemp + tempCycle + rand(-3, 3))),
        airTemp: Math.max(15, Math.min(50, base.airTemp + tempCycle + rand(-3, 3))),
        humidity: Math.max(20, Math.min(100, base.humidity + rand(-10, 10) + (rainfall > 0 ? 10 : 0))),
        rainfall,
        light: Math.max(0, Math.min(1500, base.light + rand(-100, 100) * (hour >= 6 && hour <= 18 ? 1 : 0.1))),
        wind: Math.max(0, Math.min(40, base.wind + rand(-4, 4))),
      });

      if (batch.length >= 500) {
        await prisma.sensorReading.createMany({ data: batch });
        readingsCreated += batch.length;
        batch.length = 0;
      }

      ts = new Date(ts.getTime() + interval);
    }

    if (batch.length > 0) {
      await prisma.sensorReading.createMany({ data: batch });
      readingsCreated += batch.length;
    }

    console.log(`  Station ${station.stationId}: ${readingsCreated} readings`);
  }
  console.log("Sensor readings generated.");

  // ============================================================
  // AI ANALYSES (20+ across stations/fields)
  // ============================================================
  console.log("Creating AI analyses...");
  const analysesData = [
    { stationId: station1.id, fieldId: field1a.id, cropId: createdCrops[0].id, cropHealth: 88, diseaseRisk: 12, ndre: 0.72, chlorophyllStress: 0.1, waterStress: 0.15, nutrientStress: 0.08, diseaseProbability: 0.12, stressLevel: "low", confidence: 0.91 },
    { stationId: station1.id, fieldId: field1a.id, cropId: createdCrops[0].id, cropHealth: 82, diseaseRisk: 25, ndre: 0.65, chlorophyllStress: 0.18, waterStress: 0.22, nutrientStress: 0.12, diseaseProbability: 0.25, stressLevel: "low", confidence: 0.87 },
    { stationId: station2.id, fieldId: field1b.id, cropId: createdCrops[1].id, cropHealth: 91, diseaseRisk: 8, ndre: 0.78, chlorophyllStress: 0.05, waterStress: 0.1, nutrientStress: 0.06, diseaseProbability: 0.08, stressLevel: "low", confidence: 0.93 },
    { stationId: station2.id, fieldId: field1b.id, cropId: createdCrops[1].id, cropHealth: 75, diseaseRisk: 35, ndre: 0.58, chlorophyllStress: 0.25, waterStress: 0.3, nutrientStress: 0.2, diseaseProbability: 0.35, stressLevel: "medium", confidence: 0.82 },
    { stationId: station3.id, fieldId: field1c.id, cropId: createdCrops[2].id, cropHealth: 65, diseaseRisk: 55, ndre: 0.5, chlorophyllStress: 0.35, waterStress: 0.4, nutrientStress: 0.28, diseaseProbability: 0.55, stressLevel: "high", confidence: 0.79 },
    { stationId: station3.id, fieldId: field1c.id, cropId: createdCrops[2].id, cropHealth: 58, diseaseRisk: 68, ndre: 0.42, chlorophyllStress: 0.42, waterStress: 0.48, nutrientStress: 0.35, diseaseProbability: 0.68, stressLevel: "high", confidence: 0.74 },
    { stationId: station4.id, fieldId: field2a.id, cropId: createdCrops[3].id, cropHealth: 85, diseaseRisk: 18, ndre: 0.7, chlorophyllStress: 0.12, waterStress: 0.14, nutrientStress: 0.1, diseaseProbability: 0.18, stressLevel: "low", confidence: 0.9 },
    { stationId: station4.id, fieldId: field2a.id, cropId: createdCrops[3].id, cropHealth: 78, diseaseRisk: 32, ndre: 0.6, chlorophyllStress: 0.2, waterStress: 0.25, nutrientStress: 0.18, diseaseProbability: 0.32, stressLevel: "medium", confidence: 0.85 },
    { stationId: station5.id, fieldId: field2b.id, cropId: createdCrops[4].id, cropHealth: 72, diseaseRisk: 40, ndre: 0.55, chlorophyllStress: 0.28, waterStress: 0.35, nutrientStress: 0.22, diseaseProbability: 0.4, stressLevel: "medium", confidence: 0.8 },
    { stationId: station5.id, fieldId: field2b.id, cropId: createdCrops[4].id, cropHealth: 68, diseaseRisk: 45, ndre: 0.5, chlorophyllStress: 0.32, waterStress: 0.4, nutrientStress: 0.25, diseaseProbability: 0.45, stressLevel: "medium", confidence: 0.78 },
    { stationId: station6.id, fieldId: field3a.id, cropId: createdCrops[5].id, cropHealth: 94, diseaseRisk: 5, ndre: 0.82, chlorophyllStress: 0.03, waterStress: 0.08, nutrientStress: 0.04, diseaseProbability: 0.05, stressLevel: "low", confidence: 0.95 },
    { stationId: station6.id, fieldId: field3a.id, cropId: createdCrops[5].id, cropHealth: 90, diseaseRisk: 10, ndre: 0.75, chlorophyllStress: 0.08, waterStress: 0.12, nutrientStress: 0.07, diseaseProbability: 0.1, stressLevel: "low", confidence: 0.92 },
    { stationId: station7.id, fieldId: field3b.id, cropId: createdCrops[6].id, cropHealth: 45, diseaseRisk: 72, ndre: 0.35, chlorophyllStress: 0.5, waterStress: 0.55, nutrientStress: 0.4, diseaseProbability: 0.72, stressLevel: "critical", confidence: 0.7 },
    { stationId: station7.id, fieldId: field3b.id, cropId: createdCrops[6].id, cropHealth: 40, diseaseRisk: 80, ndre: 0.3, chlorophyllStress: 0.55, waterStress: 0.6, nutrientStress: 0.45, diseaseProbability: 0.8, stressLevel: "critical", confidence: 0.68 },
    { stationId: station8.id, fieldId: field3b.id, cropId: createdCrops[6].id, cropHealth: 52, diseaseRisk: 62, ndre: 0.45, chlorophyllStress: 0.4, waterStress: 0.45, nutrientStress: 0.32, diseaseProbability: 0.62, stressLevel: "high", confidence: 0.75 },
    { stationId: station8.id, fieldId: field3a.id, cropId: createdCrops[5].id, cropHealth: 86, diseaseRisk: 15, ndre: 0.7, chlorophyllStress: 0.1, waterStress: 0.12, nutrientStress: 0.09, diseaseProbability: 0.15, stressLevel: "low", confidence: 0.89 },
    { stationId: station1.id, fieldId: field1a.id, cropId: createdCrops[0].id, cropHealth: 79, diseaseRisk: 30, ndre: 0.62, chlorophyllStress: 0.2, waterStress: 0.28, nutrientStress: 0.15, diseaseProbability: 0.3, stressLevel: "medium", confidence: 0.83 },
    { stationId: station4.id, fieldId: field2b.id, cropId: createdCrops[4].id, cropHealth: 70, diseaseRisk: 38, ndre: 0.52, chlorophyllStress: 0.3, waterStress: 0.32, nutrientStress: 0.2, diseaseProbability: 0.38, stressLevel: "medium", confidence: 0.81 },
    { stationId: station6.id, fieldId: field3b.id, cropId: createdCrops[6].id, cropHealth: 60, diseaseRisk: 50, ndre: 0.48, chlorophyllStress: 0.38, waterStress: 0.42, nutrientStress: 0.3, diseaseProbability: 0.5, stressLevel: "high", confidence: 0.76 },
    { stationId: station3.id, fieldId: field1c.id, cropId: createdCrops[2].id, cropHealth: 62, diseaseRisk: 58, ndre: 0.46, chlorophyllStress: 0.38, waterStress: 0.42, nutrientStress: 0.32, diseaseProbability: 0.58, stressLevel: "high", confidence: 0.73 },
    { stationId: station5.id, fieldId: field2b.id, cropId: createdCrops[4].id, cropHealth: 66, diseaseRisk: 48, ndre: 0.5, chlorophyllStress: 0.35, waterStress: 0.38, nutrientStress: 0.28, diseaseProbability: 0.48, stressLevel: "medium", confidence: 0.77 },
    { stationId: station8.id, fieldId: field3a.id, cropId: createdCrops[5].id, cropHealth: 88, diseaseRisk: 12, ndre: 0.72, chlorophyllStress: 0.08, waterStress: 0.1, nutrientStress: 0.07, diseaseProbability: 0.12, stressLevel: "low", confidence: 0.9 },
  ];

  for (const a of analysesData) {
    await prisma.aIAnalysis.create({
      data: {
        ...a,
        timestamp: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        result: JSON.stringify({ source: "ml_model", version: "2.1" }),
      },
    });
  }
  console.log(`Created ${analysesData.length} AI analyses.`);

  // ============================================================
  // ALERTS (17 across various types/severities)
  // ============================================================
  console.log("Creating alerts...");
  const alertsData = [
    // Critical disease risks
    { stationId: station7.id, userId: admin.id, type: "disease_risk", severity: "critical", title: "Severe Disease Risk Detected", message: "Maize crop showing 80% disease probability. Immediate intervention required.", description: "Fungal infection likely. Apply fungicide within 24 hours.", action: "Apply recommended fungicide and isolate affected area", confidence: 0.8, zone: "Field B North", status: "new" },
    { stationId: station3.id, userId: farmer.id, type: "disease_risk", severity: "critical", title: "Cotton Blight Warning", message: "Cotton field showing signs of bacterial blight. Risk level: high.", description: "Remove infected plants and apply copper-based bactericide.", action: "Remove infected plants, apply copper spray", confidence: 0.72, zone: "Field C Center", status: "acknowledged" },
    { stationId: station8.id, userId: admin.id, type: "disease_risk", severity: "warning", title: "Maize Rust Risk Increasing", message: "Moderate disease risk detected in Maize Field. Monitor closely.", description: "Conditions favorable for rust development. Preventive fungicide recommended.", action: "Apply preventive fungicide spray", confidence: 0.62, zone: "Field B South", status: "new" },

    // Soil moisture
    { stationId: station7.id, userId: admin.id, type: "soil_moisture_low", severity: "critical", title: "Critical Soil Moisture Level", message: "Soil moisture at 18% in Maize Field. Crop stress imminent.", description: "Moisture has been declining for 5 days. Urgent irrigation needed.", action: "Start emergency irrigation for 6 hours", confidence: 0.9, zone: "Field B", status: "new" },
    { stationId: station5.id, userId: fpo.id, type: "soil_moisture_low", severity: "warning", title: "Declining Soil Moisture", message: "Soil moisture trending downward in Rice Paddy. Currently at 28%.", description: "Water levels below optimal for paddy. Schedule irrigation.", action: "Schedule irrigation within 24 hours", confidence: 0.85, zone: "Paddy Block A", status: "acknowledged" },

    // Nutrient imbalance
    { stationId: station1.id, userId: farmer.id, type: "nutrient_imbalance", severity: "warning", title: "Low Nitrogen Detected", message: "Nitrogen levels at 42 mg/kg in Tomato Field A. Below optimal range.", description: "Apply nitrogen-rich fertilizer. NPK 20-10-10 recommended.", action: "Apply 50kg NPK 20-10-10 fertilizer", confidence: 0.88, zone: "Tomato Field A", status: "resolved" },
    { stationId: station6.id, userId: admin.id, type: "nutrient_imbalance", severity: "info", title: "Potassium Slightly Low", message: "Potassium at 35 mg/kg in Wheat Field. Monitor if it drops further.", description: "Borderline potassium levels. No immediate action needed.", action: "Monitor and recheck in 48 hours", confidence: 0.75, zone: "Wheat Field A", status: "new" },

    // High temperature
    { stationId: station3.id, userId: farmer.id, type: "high_temperature", severity: "warning", title: "High Air Temperature Alert", message: "Air temperature reached 42°C in Cotton Field. Heat stress risk.", description: "Ensure adequate irrigation. Consider shade nets if prolonged.", action: "Increase irrigation frequency, monitor for wilting", confidence: 0.92, zone: "Field C", status: "acknowledged" },
    { stationId: station8.id, userId: admin.id, type: "high_temperature", severity: "info", title: "Temperature Rising", message: "Air temperature at 38°C in Maize Field. Approaching threshold.", description: "Temperature expected to drop by evening. Monitor.", action: "No immediate action required", confidence: 0.8, zone: "Maize Field B", status: "resolved" },

    // Station offline
    { stationId: station7.id, userId: admin.id, type: "station_offline", severity: "critical", title: "Station AGR-007 Offline", message: "Station has been offline for 3 hours. Last heartbeat received 3 hours ago.", description: "Possible power failure or hardware malfunction. Check solar panel and battery.", action: "Dispatch field technician to inspect station", confidence: 0.99, zone: "Hyderabad Edge", status: "new" },

    // Low battery
    { stationId: station7.id, userId: admin.id, type: "low_battery", severity: "critical", title: "Critical Battery Level", message: "Station AGR-007 battery at 12%. Station will shut down soon.", description: "Solar panel may be damaged or disconnected.", action: "Replace battery or repair solar panel", confidence: 0.95, zone: "Hyderabad Edge", status: "new" },
    { stationId: station5.id, userId: fpo.id, type: "low_battery", severity: "warning", title: "Battery Below 50%", message: "Station AGR-005 battery at 45%. Solar charging may be insufficient.", description: "Check for shading on solar panel. Clean panel surface.", action: "Inspect and clean solar panel", confidence: 0.87, zone: "Mysore Station 2", status: "acknowledged" },

    // More varied
    { stationId: station4.id, userId: fpo.id, type: "disease_risk", severity: "info", title: "Low Disease Risk in Chilli", message: "Chilli crop health is good. Disease probability at 18%.", description: "Continue current management practices.", action: "No action needed", confidence: 0.9, zone: "Chilli Field A", status: "resolved" },
    { stationId: station2.id, userId: farmer.id, type: "nutrient_imbalance", severity: "info", title: "Phosphorus Level Optimal", message: "Phosphorus at 55 mg/kg in Potato Field. Within healthy range.", description: "No adjustment needed for phosphorus.", action: "Continue current fertilization schedule", confidence: 0.85, zone: "Potato Field B", status: "resolved" },
    { stationId: station1.id, userId: farmer.id, type: "high_temperature", severity: "info", title: "Temperature Normalizing", message: "Afternoon temperature peak has passed. Currently 34°C.", description: "Temperature within acceptable range.", action: "Continue monitoring", confidence: 0.91, zone: "Kumar Farm", status: "resolved" },
    { stationId: station6.id, userId: admin.id, type: "soil_moisture_low", severity: "info", title: "Moisture Adequate", message: "Soil moisture at 62% in Wheat Field. Optimal range.", description: "No irrigation needed at this time.", action: "Recheck in 24 hours", confidence: 0.88, zone: "Wheat Field A", status: "resolved" },
    { stationId: station3.id, userId: farmer.id, type: "disease_risk", severity: "warning", title: "Fungal Risk Elevated", message: "Humidity and temperature conditions favor fungal growth in Cotton.", description: "High humidity (88%) combined with warm temperatures increases fungal risk.", action: "Apply preventive fungicide if rain is forecast", confidence: 0.65, zone: "Field C", status: "new" },
  ];

  const createdAlerts = [];
  for (const a of alertsData) {
    const alert = await prisma.alert.create({
      data: {
        ...a,
        createdAt: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      },
    });
    createdAlerts.push(alert);
  }
  console.log(`Created ${createdAlerts.length} alerts.`);

  // ============================================================
  // DEVICE HEARTBEATS
  // ============================================================
  console.log("Creating device heartbeats...");
  for (const station of allStations) {
    const statuses = station.status === "offline" ? ["offline"] : ["online", "online", "warning"];
    for (let i = 0; i < 5; i++) {
      await prisma.deviceHeartbeat.create({
        data: {
          stationId: station.id,
          timestamp: new Date(now.getTime() - i * 30 * 60000 - Math.random() * 10 * 60000),
          battery: station.battery + rand(-2, 2),
          solarStatus: station.solarStatus,
          status: i === 0 ? station.status : statuses[Math.floor(Math.random() * statuses.length)],
          sensorsOk: station.status !== "offline" || i > 2,
          uptime: Math.floor(86400 * (7 - i) + rand(0, 3600)),
          storageUsed: rand(1.5, 4.2),
          pendingSync: station.status === "offline" ? Math.floor(rand(50, 200)) : Math.floor(rand(0, 10)),
        },
      });
    }
  }
  console.log(`Created ${allStations.length * 5} heartbeats.`);

  // ============================================================
  // VOICE ALERTS (5 multilingual)
  // ============================================================
  console.log("Creating voice alerts...");
  const voiceAlertsData = [
    {
      stationId: station7.id,
      alertId: createdAlerts[0]?.id,
      language: "hindi",
      message: "चेतावनी: एजीआर-007 स्टेशन ऑफलाइन है। कृपया तुरंत जांच करें।",
      delivered: true,
      deliveredAt: new Date(now.getTime() - 170 * 60000),
    },
    {
      stationId: station7.id,
      alertId: createdAlerts[3]?.id,
      language: "hindi",
      message: "महत्वपूर्ण: मक्का के खेत में मिट्टी की नमी 18% पर है। तुरंत सिंचाई करें।",
      delivered: false,
    },
    {
      stationId: station5.id,
      alertId: createdAlerts[4]?.id,
      language: "kannada",
      message: "ಎಚ್ಚರಿಕೆ: ಎಜಿಆರ್-005 ಬ್ಯಾಟರಿ 45% ಕ್ಕೆ ಇಳಿದಿದೆ. ಸೌರ ಫಲಕವನ್ನು ಪರಿಶೀಲಿಸಿ.",
      delivered: true,
      deliveredAt: new Date(now.getTime() - 120 * 60000),
    },
    {
      stationId: station4.id,
      alertId: createdAlerts[11]?.id,
      language: "kannada",
      message: "ಸೂಚನೆ: ಮೆಣಸಿನ ಬೆಳೆ ಆರೋಗ್ಯಕರವಾಗಿದೆ. ರೋಗ ಅಪಾಯ 18%.",
      delivered: false,
    },
    {
      stationId: station6.id,
      alertId: createdAlerts[16]?.id,
      language: "telugu",
      message: "హెచ్చరిక: గోధుమ పొలంలో తేమ సరిపోతుంది. 24 గంటల్లో తిరిగి తనిఖీ చేయండి.",
      delivered: true,
      deliveredAt: new Date(now.getTime() - 60 * 60000),
    },
  ];

  for (const va of voiceAlertsData) {
    await prisma.voiceAlert.create({ data: va });
  }
  console.log(`Created ${voiceAlertsData.length} voice alerts.`);

  // ============================================================
  // RECOMMENDATIONS (5)
  // ============================================================
  console.log("Creating recommendations...");
  const recommendationsData = [
    {
      alertId: createdAlerts[0]?.id,
      title: "Immediate Station Inspection",
      description: "Dispatch a field technician to inspect Station AGR-007 at Hyderabad Edge. Check solar panel connectivity, battery condition, and hardware integrity. Bring replacement battery and multimeter.",
      priority: "critical",
      category: "maintenance",
    },
    {
      alertId: createdAlerts[3]?.id,
      title: "Emergency Irrigation Protocol",
      description: "Soil moisture in Maize Field B has dropped below critical threshold. Activate drip irrigation system for 6 hours. Check for leaks in irrigation lines. Monitor moisture levels hourly.",
      priority: "critical",
      category: "irrigation",
    },
    {
      alertId: createdAlerts[5]?.id,
      title: "Nitrogen Fertilization Plan",
      description: "Apply NPK 20-10-10 at 50kg/acre to Tomato Field A. Split application: 25kg now, 25kg in 2 weeks. Water immediately after application. Retest soil nitrogen in 7 days.",
      priority: "medium",
      category: "fertilization",
    },
    {
      alertId: createdAlerts[7]?.id,
      title: "Heat Stress Mitigation",
      description: "During high temperature periods (>40°C), increase irrigation to twice daily. Install temporary shade nets over cotton plants if heat persists beyond 3 days. Monitor for wilting signs.",
      priority: "medium",
      category: "protection",
    },
    {
      alertId: createdAlerts[0]?.id,
      title: "Disease Prevention for Maize",
      description: "Apply preventive fungicide (Carbendazim 0.2%) to Maize Field B. Ensure spray coverage is uniform. Repeat application after 7 days if humidity remains above 80%.",
      priority: "high",
      category: "pest_control",
    },
  ];

  for (const r of recommendationsData) {
    await prisma.recommendation.create({ data: r });
  }
  console.log(`Created ${recommendationsData.length} recommendations.`);

  // ============================================================
  // UPDATE SENSOR LAST VALUES
  // ============================================================
  console.log("Updating sensor last values...");
  const latestReadings = await prisma.sensorReading.groupBy({
    by: ["stationId"],
    _max: { timestamp: true },
    orderBy: { stationId: "asc" },
  });

  for (const lr of latestReadings) {
    if (!lr._max.timestamp) continue;
    const latest = await prisma.sensorReading.findFirst({
      where: { stationId: lr.stationId, timestamp: lr._max.timestamp },
    });
    if (latest) {
      const stationSensors = allSensors.filter((s) => s.stationId === lr.stationId);
      for (const sensor of stationSensors) {
        let value: number | null = null;
        if (sensor.name.includes("Nitrogen")) value = latest.nitrogen;
        else if (sensor.name.includes("Phosphorus")) value = latest.phosphorus;
        else if (sensor.name.includes("Potassium")) value = latest.potassium;
        else if (sensor.name.includes("pH")) value = latest.ph;
        else if (sensor.name.includes("Moisture 1")) value = latest.moisture1;
        else if (sensor.name.includes("Moisture 2")) value = latest.moisture2;
        else if (sensor.name.includes("Temperature")) value = latest.airTemp;
        else if (sensor.name.includes("Humidity")) value = latest.humidity;

        if (value !== null) {
          await prisma.sensor.update({
            where: { id: sensor.id },
            data: { lastReading: value, lastUpdated: lr._max.timestamp },
          });
        }
      }
    }
  }
  console.log("Sensor last values updated.");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

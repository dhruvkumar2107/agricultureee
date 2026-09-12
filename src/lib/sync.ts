import { prisma } from './prisma';

type DataType = 'reading' | 'analysis' | 'alert' | 'heartbeat';

export async function addToSyncQueue(
  stationId: string,
  dataType: DataType,
  payload: Record<string, unknown>
): Promise<string> {
  const item = await prisma.syncQueue.create({
    data: {
      stationId,
      dataType,
      payload: JSON.stringify(payload),
      synced: false,
      retryCount: 0,
    },
  });

  return item.id;
}

export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const pending = await prisma.syncQueue.findMany({
    where: { synced: false },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of pending) {
    try {
      const payload = JSON.parse(item.payload);

      switch (item.dataType) {
        case 'reading':
          await prisma.sensorReading.create({
            data: {
              stationId: item.stationId,
              nitrogen: payload.nitrogen ?? null,
              phosphorus: payload.phosphorus ?? null,
              potassium: payload.potassium ?? null,
              ph: payload.ph ?? null,
              moisture1: payload.moisture1 ?? null,
              moisture2: payload.moisture2 ?? null,
              soilTemp: payload.soilTemp ?? null,
              airTemp: payload.airTemp ?? null,
              humidity: payload.humidity ?? null,
              rainfall: payload.rainfall ?? null,
              light: payload.light ?? null,
              wind: payload.wind ?? null,
              raw: payload.raw ?? null,
            },
          });
          break;

        case 'analysis':
          await prisma.aIAnalysis.create({
            data: {
              stationId: item.stationId,
              fieldId: payload.fieldId ?? null,
              cropId: payload.cropId ?? null,
              cropHealth: payload.cropHealth ?? 0,
              diseaseRisk: payload.diseaseRisk ?? 0,
              ndre: payload.ndre ?? 0,
              chlorophyllStress: payload.chlorophyllStress ?? 0,
              waterStress: payload.waterStress ?? 0,
              nutrientStress: payload.nutrientStress ?? 0,
              diseaseProbability: payload.diseaseProbability ?? 0,
              stressLevel: payload.stressLevel ?? 'low',
              confidence: payload.confidence ?? 0,
              imageUrl: payload.imageUrl ?? null,
              result: payload.result ?? null,
            },
          });
          break;

        case 'alert':
          await prisma.alert.create({
            data: {
              stationId: item.stationId,
              farmId: payload.farmId ?? null,
              userId: payload.userId ?? null,
              type: payload.type ?? 'unknown',
              severity: payload.severity ?? 'info',
              title: payload.title ?? 'Alert',
              message: payload.message ?? '',
              description: payload.description ?? null,
              action: payload.action ?? null,
              confidence: payload.confidence ?? null,
              zone: payload.zone ?? null,
              status: payload.status ?? 'new',
            },
          });
          break;

        case 'heartbeat':
          await prisma.deviceHeartbeat.create({
            data: {
              stationId: item.stationId,
              battery: payload.battery ?? null,
              solarStatus: payload.solarStatus ?? null,
              status: payload.status ?? null,
              sensorsOk: payload.sensorsOk ?? true,
              uptime: payload.uptime ?? null,
              storageUsed: payload.storageUsed ?? null,
              pendingSync: payload.pendingSync ?? 0,
            },
          });

          await prisma.station.update({
            where: { id: item.stationId },
            data: {
              battery: payload.battery ?? undefined,
              solarStatus: payload.solarStatus ?? undefined,
              status: payload.status ?? undefined,
              lastHeartbeat: new Date(),
            },
          });
          break;

        default:
          throw new Error(`Unknown data type: ${item.dataType}`);
      }

      await prisma.syncQueue.update({
        where: { id: item.id },
        data: { synced: true, syncedAt: new Date() },
      });

      processed++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to sync ${item.dataType} for station ${item.stationId}: ${message}`);

      await prisma.syncQueue.update({
        where: { id: item.id },
        data: { retryCount: { increment: 1 } },
      });
    }
  }

  return { processed, failed, errors };
}

export async function getPendingCount(stationId: string): Promise<number> {
  return prisma.syncQueue.count({
    where: {
      stationId,
      synced: false,
    },
  });
}

export async function markSynced(id: string): Promise<void> {
  await prisma.syncQueue.update({
    where: { id },
    data: { synced: true, syncedAt: new Date() },
  });
}

export async function getFailedItems(maxRetries: number = 3) {
  return prisma.syncQueue.findMany({
    where: {
      synced: false,
      retryCount: { gte: maxRetries },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function clearSyncedItems(olderThanDays: number = 7): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await prisma.syncQueue.deleteMany({
    where: {
      synced: true,
      syncedAt: { lt: cutoff },
    },
  });

  return result.count;
}

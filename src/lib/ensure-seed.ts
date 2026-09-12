import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

let seeding = false;
let seeded = false;

export async function ensureSeed() {
  if (seeded) return;
  if (seeding) {
    while (seeding) await new Promise((r) => setTimeout(r, 50));
    return;
  }
  seeding = true;
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      seeded = true;
      return;
    }

    const password = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
      data: [
        { email: 'admin@agrisentinel.com', name: 'Admin User', password, role: 'admin' },
        { email: 'farmer@demo.com', name: 'Ramesh Kumar', password, role: 'farmer' },
        { email: 'fpo@demo.com', name: 'FPO Manager', password, role: 'fpo' },
      ],
      skipDuplicates: true,
    });

    seeded = true;
  } catch (error) {
    console.error('Auto-seed error:', error);
  } finally {
    seeding = false;
  }
}

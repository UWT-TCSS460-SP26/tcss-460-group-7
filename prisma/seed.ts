import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { role: 'admin' },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${admin.username}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

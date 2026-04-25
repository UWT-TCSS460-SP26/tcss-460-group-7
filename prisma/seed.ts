import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedUsers = [
  { username: 'admin', email: 'admin@dev.local', display_name: 'Administrator', role: 1 },
  { username: 'stardust42', email: 'stardust42@dev.local', display_name: 'Stardust', role: 2 },
  { username: 'noodle_cat', email: 'noodle_cat@dev.local', display_name: null, role: 2 },
  { username: 'grizwald', email: 'grizwald@dev.local', display_name: 'Grizwald', role: 2 },
  { username: 'pixel_fox', email: 'pixel_fox@dev.local', display_name: 'Pixel Fox', role: 2 },
  { username: 'thunderbean', email: 'thunderbean@dev.local', display_name: null, role: 2 },
];

async function main() {
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: { role: u.role, display_name: u.display_name },
      create: u,
    });
    // eslint-disable-next-line no-console
    console.log(`Seeded user: ${user.username} (role: ${user.role})`);
  }
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

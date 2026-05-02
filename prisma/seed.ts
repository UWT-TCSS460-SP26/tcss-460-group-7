import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import process from 'process';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seedUsers = [
  { username: 'admin', email: 'admin@dev.local', display_name: 'Administrator', role: 2 },
  { username: 'stardust42', email: 'stardust42@dev.local', display_name: 'Stardust', role: 2 },
  { username: 'noodle_cat', email: 'noodle_cat@dev.local', display_name: null, role: 2 },
  { username: 'grizwald', email: 'grizwald@dev.local', display_name: 'Grizwald', role: 2 },
  { username: 'pixel_fox', email: 'pixel_fox@dev.local', display_name: 'Pixel Fox', role: 2 },
  { username: 'thunderbean', email: 'thunderbean@dev.local', display_name: null, role: 2 },
];

// Auth² users — subjectId must match the JWT sub claim from tcss-460-iam.onrender.com
const seedAuth2Users = [
  {
    subjectId: '36',
    username: 'skyze',
    email: 'skyzen888@gmail.com',
    display_name: 'Skyler',
    role: 1,
  },
];

async function main() {
  const createdUsers = [];

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: { role: u.role, display_name: u.display_name },
      create: u,
    });
    createdUsers.push(user);
    console.log(`Seeded user: ${user.username} (role: ${user.role})`);
  }

  for (const u of seedAuth2Users) {
    const user = await prisma.user.upsert({
      where: { subjectId: u.subjectId },
      update: { role: u.role, display_name: u.display_name },
      create: u,
    });
    console.log(`Seeded Auth² user: ${user.username} (id: ${user.id})`);
  }

  const seedReviews = [
    {
      authorId: createdUsers[0].id,
      title_id: 246,
      content: 'A truly magnificent show with great character development!',
      header: 'Masterpiece',
    },
    {
      authorId: createdUsers[1].id,
      title_id: 246,
      content: 'A bit slow at the start, but gets incredible.',
      header: 'Great Watch',
    },
    {
      authorId: createdUsers[2].id,
      title_id: 1399,
      content: 'The lore and world-building is just phenomenal.',
      header: 'Epic Fantasy',
    },
    {
      authorId: createdUsers[3].id,
      title_id: 1399,
      content: 'Disappointed with the later seasons.',
      header: 'Could be better',
    },
    {
      authorId: createdUsers[4].id,
      title_id: 1396,
      content: 'One of the best writing I have ever seen on television.',
      header: 'Incredible Writing',
    },
    {
      authorId: createdUsers[5].id,
      title_id: 1396,
      content: 'Very intense, great acting all around.',
      header: 'Intense and Gripping',
    },
    {
      authorId: createdUsers[1].id,
      title_id: 66732,
      content: 'Loved the 80s nostalgia and the mystery.',
      header: 'Spooky and Fun',
    },
    {
      authorId: createdUsers[2].id,
      title_id: 66732,
      content: 'Felt a bit repetitive after a few seasons.',
      header: 'Overrated',
    },
    {
      authorId: createdUsers[3].id,
      title_id: 456,
      content: 'Classic comedy that shaped a generation.',
      header: 'Iconic',
    },
    {
      authorId: createdUsers[4].id,
      title_id: 456,
      content: 'Has its moments, but not my absolute favorite.',
      header: 'Good for a laugh',
    },
  ];

  console.log('Seeding reviews...');
  for (const r of seedReviews) {
    try {
      const review = await prisma.review.create({ data: r });
      // eslint-disable-next-line no-console
      console.log(`Seeded review for title_id: ${review.title_id} by authorId: ${review.authorId}`);
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(
          `Review for title_id: ${r.title_id} by authorId: ${r.authorId} already exists, skipping.`
        );
      } else throw err;
    }
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

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import process from 'process';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seedUsers = [
  {
    subjectId: 'seed-admin',
    username: 'admin',
    email: 'admin@dev.local',
    display_name: 'Administrator',
    role: 2,
  },
  {
    subjectId: 'seed-stardust42',
    username: 'stardust42',
    email: 'stardust42@dev.local',
    display_name: 'Stardust',
    role: 2,
  },
  {
    subjectId: 'seed-noodle-cat',
    username: 'noodle_cat',
    email: 'noodle_cat@dev.local',
    display_name: null,
    role: 2,
  },
  {
    subjectId: 'seed-grizwald',
    username: 'grizwald',
    email: 'grizwald@dev.local',
    display_name: 'Grizwald',
    role: 2,
  },
  {
    subjectId: 'seed-pixel-fox',
    username: 'pixel_fox',
    email: 'pixel_fox@dev.local',
    display_name: 'Pixel Fox',
    role: 2,
  },
  {
    subjectId: 'seed-thunderbean',
    username: 'thunderbean',
    email: 'thunderbean@dev.local',
    display_name: null,
    role: 2,
  },
  {
    subjectId: 'seed-leah-skywalker',
    username: 'vaderSucks',
    email: 'thePrincessleah@dev.local',
    display_name: 'The princess Leah',
    role: 2,
  },
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
  {
    subjectId: '26',
    username: 'duyhung',
    email: 'duyhung@gmail.com',
    display_name: 'Le',
    role: 1,
  },
];

const reviewSeeds = [
  {
    username: 'admin',
    title_id: 246,
    content: 'A truly magnificent show with great character development!',
    header: 'Masterpiece',
  },
  {
    username: 'stardust42',
    title_id: 246,
    content: 'A bit slow at the start, but gets incredible.',
    header: 'Great Watch',
  },
  {
    username: 'noodle_cat',
    title_id: 1399,
    content: 'The lore and world-building is just phenomenal.',
    header: 'Epic Fantasy',
  },
  {
    username: 'grizwald',
    title_id: 1399,
    content: 'Disappointed with the later seasons.',
    header: 'Could be better',
  },
  {
    username: 'pixel_fox',
    title_id: 1396,
    content: 'One of the best writing I have ever seen on television.',
    header: 'Incredible Writing',
  },
  {
    username: 'thunderbean',
    title_id: 1396,
    content: 'Very intense, great acting all around.',
    header: 'Intense and Gripping',
  },
  {
    username: 'stardust42',
    title_id: 66732,
    content: 'Loved the 80s nostalgia and the mystery.',
    header: 'Spooky and Fun',
  },
  {
    username: 'noodle_cat',
    title_id: 66732,
    content: 'Felt a bit repetitive after a few seasons.',
    header: 'Overrated',
  },
  {
    username: 'grizwald',
    title_id: 456,
    content: 'Classic comedy that shaped a generation.',
    header: 'Iconic',
  },
  {
    username: 'pixel_fox',
    title_id: 456,
    content: 'Has its moments, but not my absolute favorite.',
    header: 'Good for a laugh',
  },
  {
    username: 'vaderSucks',
    title_id: 1891,
    content: 'Vader really sucks a lot!',
    header: 'The Empire will fall!',
  },
];

const ratingTitleIds = [550, 680, 13, 155, 27205, 603, 157336, 246, 1399, 1396, 66732, 456, 1891];

const buildSeededRating = (authorId: number, titleId: number) => ({
  authorId,
  title_id: titleId,
  // Deterministic pseudo-random 1-5 rating so reseeding stays stable.
  rating: ((authorId * 17 + titleId * 7) % 5) + 1,
});

async function seedUsersAndReturnMap() {
  const allSeedUsers = [...seedUsers, ...seedAuth2Users];
  const usersByUsername = new Map<string, Awaited<ReturnType<typeof prisma.user.upsert>>>();

  for (const userSeed of allSeedUsers) {
    const user = await prisma.user.upsert({
      where: { subjectId: userSeed.subjectId },
      update: {
        username: userSeed.username,
        email: userSeed.email,
        display_name: userSeed.display_name,
        role: userSeed.role,
      },
      create: userSeed,
    });

    usersByUsername.set(user.username, user);
    console.log(`Seeded user: ${user.username} (id: ${user.id}, role: ${user.role})`);
  }

  return usersByUsername;
}

async function seedReviews(usersByUsername: Map<string, { id: number }>) {
  console.log('Seeding reviews...');

  for (const reviewSeed of reviewSeeds) {
    const author = usersByUsername.get(reviewSeed.username);

    if (!author) {
      console.log(`Skipping review for missing user: ${reviewSeed.username}`);
      continue;
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: author.id,
        title_id: reviewSeed.title_id,
        header: reviewSeed.header,
      },
    });

    if (existingReview) {
      console.log(
        `Review for title_id: ${reviewSeed.title_id} by ${reviewSeed.username} already exists, skipping.`
      );
      continue;
    }

    const review = await prisma.review.create({
      data: {
        authorId: author.id,
        title_id: reviewSeed.title_id,
        content: reviewSeed.content,
        header: reviewSeed.header,
      },
    });

    console.log(`Seeded review for title_id: ${review.title_id} by authorId: ${review.authorId}`);
  }
}

async function seedRatings(usersByUsername: Map<string, { id: number }>) {
  console.log('Seeding ratings...');

  for (const user of usersByUsername.values()) {
    for (const titleId of ratingTitleIds) {
      const ratingSeed = buildSeededRating(user.id, titleId);

      const rating = await prisma.rating.upsert({
        where: {
          authorId_title_id: {
            authorId: ratingSeed.authorId,
            title_id: ratingSeed.title_id,
          },
        },
        update: {
          rating: ratingSeed.rating,
        },
        create: ratingSeed,
      });

      console.log(
        `Seeded rating ${rating.rating} for title_id: ${titleId} by authorId: ${user.id}`
      );
    }
  }
}

async function main() {
  const usersByUsername = await seedUsersAndReturnMap();
  await seedReviews(usersByUsername);
  await seedRatings(usersByUsername);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

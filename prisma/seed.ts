// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// 1. Setup the connection pool using your env variable
const connectionString = `${process.env.DATABASE_URL}`;

// 2. Create the Pool and Adapter
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client with the adapter (REQUIRED for Prisma 7)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.gamePlayerFaction.deleteMany();
  await prisma.game.deleteMany();
  await prisma.league.deleteMany();
  await prisma.player.deleteMany();
  await prisma.faction.deleteMany();
  console.log('🧹 Database cleared.');

  // Create Players
  const [p1, p2] = await prisma.$transaction([
    prisma.player.create({ data: { name: 'Pasha' } }),
    prisma.player.create({ data: { name: 'Sveta' } }),
  ]);

  // Create Factions
  const [f1, f2] = await prisma.$transaction([
    prisma.faction.create({ data: { name: 'Federation of Sol' } }),
    prisma.faction.create({ data: { name: 'Emirates of Hacan' } }),
  ]);

  console.log('👥 Seeded players and factions.');

  // Create League
  const league = await prisma.league.create({
    data: {
      name: 'Winter League',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
  });
  console.log('🏆 Created league:', league.name);

  // Create Games
  const game1 = await prisma.game.create({
    data: {
      leagueId: league.id,
      gameDate: new Date('2025-11-01T18:00:00Z'),
      isLongGame: false,
      winPoints: 10,
    },
  });

  const game2 = await prisma.game.create({
    data: {
      leagueId: league.id,
      gameDate: new Date('2025-11-07T18:00:00Z'),
      isLongGame: true,
      winPoints: 14,
    },
  });

  // Create Entries
  await prisma.gamePlayerFaction.createMany({
    data: [
      { gameId: game1.id, playerId: p1.id, factionId: f1.id, points: 8 },
      { gameId: game1.id, playerId: p2.id, factionId: f2.id, points: 10 },
      { gameId: game2.id, playerId: p1.id, factionId: f2.id, points: 14 },
      { gameId: game2.id, playerId: p2.id, factionId: f1.id, points: 12 },
    ],
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
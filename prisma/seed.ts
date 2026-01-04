// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.gamePlayerFaction.deleteMany();
  await prisma.game.deleteMany();
  await prisma.league.deleteMany();
  await prisma.player.deleteMany();
  await prisma.faction.deleteMany();
  await prisma.condition.deleteMany();
  await prisma.picture.deleteMany();
  await prisma.icon.deleteMany();

  console.log('🧹 Database cleared.');

  const playerCsv = parse(fs.readFileSync(path.join(__dirname, 'data/Players.csv')), {columns: true}) as CsvRow[];
  const factionCsv = parse(fs.readFileSync(path.join(__dirname, 'data/Factions.csv')), {columns: true}) as CsvRow[];
  const conditionCsv = parse(fs.readFileSync(path.join(__dirname, 'data/Conditions.csv')), {columns: true}) as CsvRow[];
  const gameCsv = parse(fs.readFileSync(path.join(__dirname, 'data/Games.csv')), {columns: true}) as CsvGameRow[];

  await Promise.all(conditionCsv.map(c =>  c.Name && prisma.condition.create({ data: { name: c.Name }})));
  console.log('⚙️  Seeded conditions.');

  for(const fac of factionCsv) {
    const fileName = fac.Name.toLowerCase().replace(/\s+/g, '_') + '.png';
    await prisma.faction.create({ 
      data: { 
        name: fac.Name,
        icon: { create: {url: `/public/factions/${fileName}`}} 
      } 
    });
  }

  for(const plr of playerCsv) {
    const fileName = plr.Name.toLowerCase().replace(/\s+/g, '_') + '.png';
    await prisma.player.create({ 
      data: { 
        name: plr.Name,
        picture: { create: {url: `/public/players/${fileName}`}} 
      } 
    });
  }

  const league = await prisma.league.create({
    data: {
      name: 'Winter League 2026',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-02-28'),
    },
  });
  console.log('🏆 Created league:', league.name);
     

  const playerMap = Object.fromEntries(
    (await prisma.player.findMany()).map((p) => [p.name, p.id])
  );

  const factionMap = Object.fromEntries(
    (await prisma.faction.findMany()).map((f) => [f.name, f.id])
  );

  const condMap = Object.fromEntries(
    (await prisma.condition.findMany()).map((c) => [c.name, c.id])
  );

  let cuttentGameId: string | null = null;

  for(let i = 0; i < gameCsv.length; i++) {
    const row = gameCsv[i];

    if(!row) continue;
    
    if(row.Game && row.Game.startsWith('Game')) {

      const dateRow = gameCsv[i + 1];
      const statusRow = gameCsv[i + 3];

      const newGame = await prisma.game.create({
        data: {
          name: row.Game,
          leagueId: league.id,
          gameDate: new Date(dateRow?.Game || Date.now()),
          status: statusRow?.Game?.toUpperCase() === 'PASSED' ? 'Passed' : 'Future',
        },
      });
      cuttentGameId = newGame.id;
      console.log('🎲 Created game on', newGame.gameDate.toDateString());
    }

    if(cuttentGameId && row.Players) {
      const pId = playerMap[row.Players];
      const fId = factionMap[row.Factions || ""];
      const cId = condMap[row.Condition || ""];

      if(pId && fId && cId) {
        await prisma.gamePlayerFaction.create({
          data: {
            gameId: cuttentGameId, 
            playerId: pId,
            factionId: fId,
            points: parseInt(row.Points || '0'),
            conditionId: cId,
          },
        });
      }
    }
  }

  console.log('👥 Seeded players and factions.');



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

  interface CsvRow {
    Name: string;
    Id?: string;
  }

  interface CsvGameRow {
    Game?: string;
    Players?: string;  
    Factions?: string;
    Points?: string;
    Condition?: string;
  }
// Import the type FastifyInstance so TypeScript knows what "app" looks like.
import { FastifyInstance } from 'fastify';

// Import PrismaClient to talk to your PostgreSQL database.
import { PrismaClient } from '@prisma/client';

// Import your Redis helper functions: read from cache, write to cache.
import { cacheGet, cacheSet } from '../lib/cache.js';

// Create one Prisma instance for this file to run SQL queries.
const prisma = new PrismaClient();

// Export a function that adds all routes related to "leagues".
export async function leaguesRoutes(app: FastifyInstance) {

  // -------------------------------------------------------------
  // ROUTE 1: GET /leagues
  // -------------------------------------------------------------
  // This route returns all leagues (seasons).
  app.get('/leagues', async () => {
    // Fetch all leagues from DB, sorted by newest startDate first.
    return prisma.league.findMany({ 
      orderBy: { startDate: 'desc' } 
    });
  });

  // -------------------------------------------------------------
  // ROUTE 2: GET /leagues/:leagueId/dates
  // -------------------------------------------------------------
  // This defines a route with a URL parameter: :leagueId
  app.get<{
    Params: { leagueId: string }
  }>('/leagues/:leagueId/dates', async (req) => {
    // Extract the leagueId from the URL.
    const { leagueId } = req.params;

    // Prepare a Redis cache key, unique for this league.
    const key = `league:${leagueId}:dates`;

    // Try reading cached dates from Redis.
    const cached = await cacheGet<any[]>(key);
    // If Redis has it → return immediately (super fast).
    if (cached) return cached;

    // If cache is empty, query the database:
    // Get all unique dates where games happened for this league.
    const rows = await prisma.$queryRaw<Array<{ date: string }>>`
      SELECT DISTINCT DATE("gameDate")::text AS date
      FROM games 
      WHERE "leagueId" = ${leagueId}
      ORDER BY date
    `;

    // Save result to Redis for future requests.
    await cacheSet(key, rows);

    // Return the fresh database result.
    return rows;
  });

  // -------------------------------------------------------------
  // ROUTE 3: GET /leagues/:leagueId/dates/:isoDate
  // -------------------------------------------------------------
  // This route gets table for a specific date in a league.
  app.get<{
    Params: { leagueId: string; isoDate: string }
  }>('/leagues/:leagueId/dates/:isoDate', async (req) => {
    // Extract URL params.
    const { leagueId, isoDate } = req.params;

    //Create a unique cache key for this league + this date.
    const key = `league:${leagueId}:date:${isoDate}:table`;

    // Try reading table data from Redis.
    const cached = await cacheGet<any[]>(key);
    if (cached) return cached;

    // Query database:
    // For this date → get each player's faction + points.
    const rows = await prisma.$queryRaw<
      Array<{ playername: string; factionname: string; points: number }>
    >`
      SELECT 
        p.name AS "playerName",
        f.name AS "factionName",
        gpf.points
      FROM game_player_factions gpf
      JOIN players p  ON p.id = gpf."playerId"
      JOIN factions f ON f.id = gpf."factionId"
      JOIN games g    ON g.id = gpf."gameId"
      WHERE 
        g."leagueId" = ${leagueId}
        AND DATE(g."gameDate") = ${isoDate}
      ORDER BY "playerName"
    `;

    // 2️⃣1️⃣ Save to Redis so next time it loads instantly.
    await cacheSet(key, rows);

    // 2️⃣2️⃣ Return results from the database.
    return rows;
  });

  // -------------------------------------------------------------
  // ROUTE 4: GET /leagues/:leagueId/standings
  // -------------------------------------------------------------
  // 2️⃣3️⃣ This route returns the total points per player for the season.
  app.get<{
    Params: { leagueId: string }
  }>('/leagues/:leagueId/standings', async (req) => {

    // 2️⃣4️⃣ Extract leagueId from URL.
    const { leagueId } = req.params;

    // 2️⃣5️⃣ Cache key for standings.
    const key = `league:${leagueId}:standings`;

    // 2️⃣6️⃣ Try Redis first.
    const cached = await cacheGet<any[]>(key);
    if (cached) return cached;

    // 2️⃣7️⃣ Query DB:
    // Sum all points for each player across the whole league.
    const rows = await prisma.$queryRaw<
      Array<{ playername: string; totalpoints: number }>
    >`
      SELECT 
        p.name AS "playerName",
        SUM(gpf.points)::int AS "totalPoints"
      FROM game_player_factions gpf
      JOIN players p ON p.id = gpf."playerId"
      JOIN games g   ON g.id = gpf."gameId"
      WHERE g."leagueId" = ${leagueId}
      GROUP BY p.name
      ORDER BY "totalPoints" DESC, p.name
    `;

    // 2️⃣8️⃣ Save standings to Redis.
    await cacheSet(key, rows);

    // 2️⃣9️⃣ Return fresh data.
    return rows;
  });
}

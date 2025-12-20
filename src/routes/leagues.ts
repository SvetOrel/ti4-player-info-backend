import type { FastifyInstance } from 'fastify';

// // Import PrismaClient to talk to your PostgreSQL database.
// import { prisma } from '@prisma/client';

// // Import your Redis helper functions: read from cache, write to cache.
// import { cacheGet, cacheSet } from '../lib/cache.js';

// // Create one Prisma instance for this file to run SQL queries.
// import { prisma } from '../db/prisma.js';

export async function leaguesRoutes(fastify: FastifyInstance) {

   // -------------------------------------------------------------
   // ROUTE 1: GET /leagues
   // -------------------------------------------------------------
  fastify.get('/leagues', {
    schema:{
      summary: 'Get all leagues',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' },
            }
          }
        }
      }
    }
  }, async (request, reply) => {
      const leagues = await fastify.prisma.league.findMany({
        orderBy: { startDate: 'desc' }
      });
      return leagues;
  });

  // -------------------------------------------------------------
  // ROUTE 2: GET /leagues/:leagueId/dates
  // -------------------------------------------------------------
  fastify.get<{Params: { leagueId: string }}>('/leagues/:leagueId/dates', async (request,reply) => {
    const { leagueId } = request.params;
    const cacheKey = `league:dates:${leagueId}`;

    try{

      const cachedData = await fastify.redis.get(cacheKey);

      if(cachedData){
        fastify.log.info({cacheKey},'Dates - Cache HIT');
        return cachedData;
      }

      fastify.log.info({cacheKey},'Dates - Cache MISS');

      const games = await fastify.prisma.game.findMany({
        where: { leagueId: leagueId },
        include: {
          entries:{
            include:{
              player: true,
              faction: true
            }
          }
        },
        orderBy: { gameDate: 'asc' }
      });

      //Flatten data for a single table view
      const tableData = games.flatMap((game: any) => 
        game.entries.map((entry: any) => ({
          date: game.gameDate,
          playerName: entry.player.name,
          factionName: entry.faction.name,
          points: entry.points
        }))
      );

      // Cache for 1 hour
      await fastify.redis.set(cacheKey, tableData, { ex: 3600 }); 

      return tableData;

    }catch(err){
      fastify.log.error(err);
      reply.status(500).send({ error: 'Internet Server Error' });
    }   
  });

  // -------------------------------------------------------------
  // ROUTE 3: GET /leagues/:leagueId/summary
  // -------------------------------------------------------------
  fastify.get<{Params: { leagueId: string }}>('/leagues/:leagueId/summary', async (request,reply) => {
    const { leagueId } = request.params;
    const cacheKey = `league:summary:${leagueId}`;

    try{

      const cachedData = await fastify.redis.get(cacheKey);

      if(cachedData){
        fastify.log.info({cacheKey},'Summary - Cache HIT');
        return cachedData;
      }

      fastify.log.info({cacheKey},'Summary - Cache MISS');

      const summary = await fastify.prisma.gamePlayerFaction.groupBy({
        by: ['playerId'],
        where: {
          game: { leagueId: leagueId }
        },
        _sum: { 
          points: true 
        }
      });

      //Fetch player names to match IDs
      const players = await fastify.prisma.player.findMany();
      const tableData = summary.map((smr: any) => ({
        playerName: players.find((p: any) => p.id === smr.playerId)?.name || 'Unknown',
        totalPoints: smr._sum.points || 0
      }));

      // Cache for 24 hours
      await fastify.redis.set(cacheKey, tableData, { ex: 86400 }); 

      return tableData;

    }catch(err){
      fastify.log.error(err);
      reply.status(500).send({ error: 'Internet Server Error' });
    }
  });
}

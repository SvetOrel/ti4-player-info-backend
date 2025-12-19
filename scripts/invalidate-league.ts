import { redisClient } from '../src/cache/redis.js';

async function invalidateLeague(leagueId: string) {
    const keys = [
        `league:dates:${leagueId}`,
        `league:summary:${leagueId}`
    ]

    console.log(`Invalidating cache for league ID: ${leagueId}`);
    await redisClient.del(...keys);
    console.log('Done');
}

invalidateLeague(process.argv[2]!);

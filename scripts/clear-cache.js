import { redisClient } from '../src/cache/redis.js';

async function clearAllCache() {
    console.log('Clearing all cache from Redis...');
    try {
        await redisClient.flushdb();
        console.log('All cache cleared successfully.');
    } catch (error) {
        console.error('Error clearing cache:', error);
    } finally {
        process.exit(0);
    }
}

clearAllCache();
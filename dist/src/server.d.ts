import 'dotenv/config';
import { prismaClient } from './db/prisma.js';
import { redisClient } from './cache/redis.js';
declare module 'fastify' {
    interface FastifyInstance {
        prisma: typeof prismaClient;
        redis: typeof redisClient;
    }
}
//# sourceMappingURL=server.d.ts.map
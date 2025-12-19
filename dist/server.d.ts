import 'dotenv/config';
import { prismaClient } from './db/prisma';
import { redisClient } from './cache/redis';
declare module 'fastify' {
    interface FastifyInstance {
        prisma: typeof prismaClient;
        redis: typeof redisClient;
    }
}
//# sourceMappingURL=server.d.ts.map
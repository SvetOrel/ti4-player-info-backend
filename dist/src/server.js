import 'dotenv/config';
import Fastify, { fastify } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prismaClient } from './db/prisma.js';
import { redisClient } from './cache/redis.js';
import { leaguesRoutes } from './routes/leagues.js';
const PORT = Number(process.env.PORT ?? 3000);
const HOST = '0.0.0.0';
async function buildApp() {
    const fastify = Fastify({
        logger: true
    });
    await fastify.register(cors, {
        origin: '*',
        methods: ['GET']
    });
    await fastify.register(swagger, {
        swagger: {
            info: {
                title: 'TI4 Player Info API',
                description: 'Read-only API for Twilight Imperium 4 player and league data.',
                version: '1.0.0',
            },
            externalDocs: {
                url: 'https://swagger.io',
                description: 'Find more info here'
            },
            host: `localhost:${PORT}`, // Default host for local development
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
        },
    });
    await fastify.register(swaggerUi, { routePrefix: '/docs' });
    await fastify.register(leaguesRoutes, { prefix: '/api/v1' });
    fastify.decorate('prisma', prismaClient);
    fastify.decorate('redis', redisClient);
    return fastify;
}
async function startServer() {
    const fastify = await buildApp();
    try {
        await fastify.listen({ port: PORT, host: HOST });
        fastify.log.info(`Server listening on ${HOST}:${PORT}`);
        fastify.log.info(`Documentation available at http://${HOST}:${PORT}/documentation`);
    }
    catch (err) {
        fastify.log.error(err);
        // Cleanup database and redis connections on error
        await prismaClient.$disconnect();
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map
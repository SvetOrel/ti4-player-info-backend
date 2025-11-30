// Load environment variables from the .env file (so process.env works)
import 'dotenv/config';

// Import Fastify (our web framework)
import Fastify from 'fastify';

// Import useful Fastify plugins
import cors from '@fastify/cors'; // Allows API requests from other domains (like your frontend)
import swagger from '@fastify/swagger'; // Automatically generates OpenAPI (API documentation)
import swaggerUi from '@fastify/swagger-ui'; // Provides a web page at /docs to view/test API

// Import your routes (separated for clarity)
import { leaguesRoutes } from './routes/leagues.js';

// Create a new Fastify application instance with built-in logger
const app = Fastify({ logger: true });

// Register the CORS plugin so browsers can call your API from other origins
// For example, your future frontend hosted on Vercel will be allowed.
await app.register(cors, { origin: true });

// Register Swagger (OpenAPI) documentation generator
await app.register(swagger, {
  openapi: {
    info: { title: 'TI4 API', version: '1.0.0' }  // Meta info visible in /docs
  }
});

// Register the Swagger-UI plugin
// This provides a pretty HTML interface at /docs to explore your endpoints.
await app.register(swaggerUi, { routePrefix: '/docs' });

// A simple health-check route.
// Used by you or hosting (Render) to confirm the server is alive.
app.get('/health', async () => ({ ok: true }));

// Register your main routes file (it contains /leagues, /standings, etc.)
await app.register(leaguesRoutes);

// Define the port (from .env or default 3000)
const port = Number(process.env.PORT ?? 3000);

// Always listen on all interfaces (important for cloud deployment)
const host = '0.0.0.0';

// Start the Fastify server
app.listen({ port, host })
  .catch((err) => {
    // If startup fails, log the error and exit the process
    app.log.error(err);
    process.exit(1);
  });

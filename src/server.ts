import Fastify from 'fastify';
import { env } from './core/config.js';
import sessionRoutes from './routes/session.js';
import executeRoutes from './routes/execute.js';
import { ApiError } from './core/errors.js';
import { pool } from './db/postgres.js';

const app = Fastify({
  logger: true,
  trustProxy: true
});

await app.register(sessionRoutes);
await app.register(executeRoutes);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      error_code: error.errorCode,
      message: error.message,
      ...(error.meta ?? {})
    });
  }

  request.log.error(error);
  return reply.status(500).send({
    error_code: 'INTERNAL_ERROR',
    message: 'Internal server error.'
  });
});

app.addHook('onClose', async () => {
  await pool.end();
});

try {
  await app.listen({
    host: '0.0.0.0',
    port: env.port
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

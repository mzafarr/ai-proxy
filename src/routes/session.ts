import type { FastifyPluginAsync } from 'fastify';
import { issueAccessToken } from '../core/auth.js';
import { ApiError } from '../core/errors.js';
import { pool } from '../db/postgres.js';
import type { Tier } from '../core/config.js';

type BootstrapBody = {
  app_id: string;
  installation_id: string;
};

const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: BootstrapBody }>('/session/bootstrap', async (request, reply) => {
    const { app_id: appId, installation_id: installationId } = request.body ?? {};

    if (!appId || !installationId) {
      throw new ApiError(400, 'BAD_REQUEST', 'app_id and installation_id are required.');
    }

    await pool.query(
      `INSERT INTO installations (app_id, installation_id, tier)
       VALUES ($1, $2, 'free')
       ON CONFLICT (app_id, installation_id) DO NOTHING`,
      [appId, installationId]
    );

    const tierResult = await pool.query<{ tier: Tier }>(
      `SELECT tier FROM installations
       WHERE app_id = $1 AND installation_id = $2`,
      [appId, installationId]
    );

    if (!tierResult.rowCount) {
      throw new ApiError(500, 'INTERNAL_ERROR', 'Failed to load installation tier.');
    }

    const tier = tierResult.rows[0].tier;
    const { accessToken, expiresAt } = issueAccessToken({
      app_id: appId,
      installation_id: installationId,
      tier
    });

    return reply.send({
      access_token: accessToken,
      expires_at: expiresAt,
      tier
    });
  });
};

export default sessionRoutes;

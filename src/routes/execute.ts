import type { FastifyPluginAsync } from 'fastify';
import { env } from '../core/config.js';
import { verifyAccessToken } from '../core/auth.js';
import { getFeatureConfig } from '../core/featureRegistry.js';
import { runLlm } from '../core/llm.js';
import { ApiError } from '../core/errors.js';
import { consumeDailyQuota, ensureUsageRow } from '../core/quota.js';

type ExecuteBody = {
  app_id: string;
  installation_id: string;
  feature: string;
  text: string;
  request_id?: string;
};

const executeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: ExecuteBody }>('/ai/execute', async (request, reply) => {
    const startedAt = Date.now();
    const claims = verifyAccessToken(request.headers.authorization);

    const {
      app_id: appId,
      installation_id: installationId,
      feature,
      text,
      request_id: requestId
    } = request.body ?? {};

    if (!appId || !installationId || !feature || typeof text !== 'string') {
      throw new ApiError(400, 'BAD_REQUEST', 'app_id, installation_id, feature, and text are required.');
    }

    if (claims.app_id !== appId || claims.installation_id !== installationId) {
      throw new ApiError(401, 'TOKEN_INVALID', 'Token claims do not match request identity.');
    }

    if (text.length > env.maxInputChars) {
      throw new ApiError(400, 'INPUT_TOO_LONG', `Input exceeds ${env.maxInputChars} characters.`);
    }

    const featureConfig = getFeatureConfig(feature);
    if (!featureConfig) {
      throw new ApiError(400, 'BAD_REQUEST', `Unknown feature: ${feature}`);
    }

    const dailyLimit = claims.tier === 'pro' ? env.proDailyLimit : env.freeDailyLimit;

    await ensureUsageRow(appId, installationId);
    const usedToday = await consumeDailyQuota(appId, installationId, dailyLimit);
    if (usedToday === null) {
      throw new ApiError(429, 'DAILY_CAP_REACHED', 'You have reached your daily limit.', {
        remaining_today: 0
      });
    }

    const clientAbortController = new AbortController();
    request.raw.on('close', () => clientAbortController.abort());

    try {
      const outputText = await runLlm({
        feature: featureConfig,
        userText: text,
        timeoutMs: env.requestTimeoutMs,
        fallbackMaxTokens: env.maxOutputTokens,
        signal: clientAbortController.signal
      });

      const remainingToday = Math.max(dailyLimit - usedToday, 0);
      const resetAt = new Date();
      resetAt.setUTCHours(24, 0, 0, 0);

      request.log.info({
        app_id: appId,
        installation_id: installationId,
        request_id: requestId,
        feature,
        tier: claims.tier,
        input_length: text.length,
        latency_ms: Date.now() - startedAt,
        error_code: null
      });

      return reply.send({
        text: outputText,
        remaining_today: remainingToday,
        used_today: usedToday,
        reset_at: resetAt.toISOString()
      });
    } catch (error) {
      request.log.error({
        app_id: appId,
        installation_id: installationId,
        request_id: requestId,
        feature,
        tier: claims.tier,
        input_length: text.length,
        latency_ms: Date.now() - startedAt,
        error_code: error instanceof ApiError ? error.errorCode : 'INTERNAL_ERROR'
      });
      throw error;
    }
  });
};

export default executeRoutes;

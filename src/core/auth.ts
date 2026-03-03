import jwt from 'jsonwebtoken';
import { env, type Tier } from './config.js';
import { ApiError } from './errors.js';

const SESSION_TTL_SECONDS = 15 * 60;

type JwtPayload = {
  app_id: string;
  installation_id: string;
  tier: Tier;
  iat: number;
  exp: number;
};

export type SessionClaims = Pick<JwtPayload, 'app_id' | 'installation_id' | 'tier' | 'exp'>;

export const issueAccessToken = (payload: {
  app_id: string;
  installation_id: string;
  tier: Tier;
}): { accessToken: string; expiresAt: number } => {
  const accessToken = jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: SESSION_TTL_SECONDS
  });

  const decoded = jwt.decode(accessToken) as JwtPayload | null;
  if (!decoded?.exp) {
    throw new Error('Failed to decode token expiry');
  }

  return {
    accessToken,
    expiresAt: decoded.exp
  };
};

export const verifyAccessToken = (authorizationHeader: string | undefined): SessionClaims => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'TOKEN_INVALID', 'Missing or invalid bearer token.');
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new ApiError(401, 'TOKEN_INVALID', 'Missing bearer token.');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as JwtPayload;
    return {
      app_id: decoded.app_id,
      installation_id: decoded.installation_id,
      tier: decoded.tier,
      exp: decoded.exp
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Token expired.');
    }
    throw new ApiError(401, 'TOKEN_INVALID', 'Invalid token.');
  }
};

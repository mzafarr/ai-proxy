import { timingSafeEqual } from 'node:crypto';
import { env } from './config.js';
import { ApiError } from './errors.js';

const HOUR_MS = 60 * 60 * 1000;

type RateLimitResult = {
  allowed: boolean;
  retryAfterSec: number;
};

type Bucket = {
  windowStartedAtMs: number;
  count: number;
};

class FixedWindowLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly maxPerWindow: number,
    private readonly windowMs: number
  ) {}

  consume(key: string): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now - bucket.windowStartedAtMs >= this.windowMs) {
      this.buckets.set(key, { windowStartedAtMs: now, count: 1 });
      return { allowed: true, retryAfterSec: 0 };
    }

    if (bucket.count >= this.maxPerWindow) {
      const retryAfterSec = Math.ceil((bucket.windowStartedAtMs + this.windowMs - now) / 1000);
      return { allowed: false, retryAfterSec };
    }

    bucket.count += 1;
    return { allowed: true, retryAfterSec: 0 };
  }
}

const bootstrapLimiter = new FixedWindowLimiter(env.bootstrapRateLimitPerHour, HOUR_MS);

const secureEquals = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
};

export const enforceAppKey = (appKeyHeader: string | string[] | undefined): void => {
  const appKey = Array.isArray(appKeyHeader) ? appKeyHeader[0] : appKeyHeader;
  if (!appKey || !secureEquals(appKey, env.appSecret)) {
    throw new ApiError(401, 'APP_KEY_INVALID', 'Invalid app key.');
  }
};

export const enforceBootstrapRateLimit = (ip: string): RateLimitResult => {
  return bootstrapLimiter.consume(ip);
};

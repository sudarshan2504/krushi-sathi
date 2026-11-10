import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimiterOptions {
  keyPrefix: string;
  windowMs?: number;
  maxRequests: number | (() => number);
  message?: string;
}

// Shared in-memory bucket store keyed by limiter prefix + caller key
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale records periodically (unref so test processes exit cleanly)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 3 * 60 * 1000);
if (typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

export function resetRateLimiters(prefix?: string): void {
  if (!prefix) {
    rateLimitStore.clear();
    return;
  }
  for (const key of rateLimitStore.keys()) {
    if (key.startsWith(`${prefix}:`)) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

export function createRateLimiter(options: RateLimiterOptions) {
  const windowMs = options.windowMs ?? 60 * 1000;

  return function rateLimiterMiddleware(
    req: Request & { user?: { id: string } },
    res: Response,
    next: NextFunction
  ): void {
    const callerKey = req.user?.id ? `user-${req.user.id}` : `ip-${getClientIp(req)}`;
    const bucketKey = `${options.keyPrefix}:${callerKey}`;
    const maxRequests =
      typeof options.maxRequests === 'function' ? options.maxRequests() : options.maxRequests;
    const now = Date.now();

    const current = rateLimitStore.get(bucketKey);

    if (!current || now > current.resetTime) {
      rateLimitStore.set(bucketKey, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - 1));
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetTime - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.status(429).json({
        success: false,
        message:
          options.message ||
          `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
      });
      return;
    }

    current.count += 1;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current.count));
    next();
  };
}

/**
 * In-memory rate limiter for authentication routes:
 * Limits each IP to 10 requests/min in production (100/min in dev/test, overrideable via env).
 */
export const authRateLimiter = createRateLimiter({
  keyPrefix: 'auth',
  windowMs: 60 * 1000,
  maxRequests: () => {
    const envMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '', 10);
    if (!isNaN(envMax) && envMax > 0) return envMax;
    return process.env.NODE_ENV === 'production' ? 10 : 100;
  },
  message: 'Too many authentication attempts from this IP. Please wait before trying again.',
});


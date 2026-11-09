import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory bucket store for auth endpoints
const ipRequestStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 3 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestStore.entries()) {
    if (now > record.resetTime) {
      ipRequestStore.delete(ip);
    }
  }
}, 3 * 60 * 1000);

/**
 * Simple in-memory rate limiter for authentication routes:
 * Limits each IP to 10 requests per minute without external dependencies.
 */
export function authRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    req.ip ||
    '127.0.0.1';

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const isDev = process.env.NODE_ENV !== 'production';
  const maxRequests = isDev ? 100 : 10;

  const current = ipRequestStore.get(ip);

  if (!current || now > current.resetTime) {
    ipRequestStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
    return next();
  }

  if (current.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((current.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.status(429).json({
      success: false,
      message: `Too many authentication attempts from this IP. Please wait ${retryAfterSeconds} seconds before trying again.`,
    });
    return;
  }

  current.count += 1;
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - current.count);
  next();
}

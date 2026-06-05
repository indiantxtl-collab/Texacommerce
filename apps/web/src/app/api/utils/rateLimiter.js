// In-memory rate limiter for auth routes
const attempts = new Map(); // { ip: { count, resetAt } }

export function rateLimitAuth(ip, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = attempts.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= maxAttempts) {
      const remainingMs = record.resetAt - now;
      return {
        allowed: false,
        remainingMs,
        retryAfter: Math.ceil(remainingMs / 1000),
      };
    }
    record.count++;
    return { allowed: true };
  }

  // Reset or create new record
  attempts.set(ip, { count: 1, resetAt: now + windowMs });
  return { allowed: true };
}

export function resetRateLimit(ip) {
  attempts.delete(ip);
}

// Cleanup old entries every 30 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of attempts.entries()) {
      if (now >= record.resetAt) {
        attempts.delete(ip);
      }
    }
  },
  30 * 60 * 1000,
);

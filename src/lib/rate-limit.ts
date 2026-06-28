const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
export const MAX_ENTRIES = 10_000;

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  if (Math.random() < 0.01 || rateLimitMap.size > MAX_ENTRIES) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Hard cap the map. A caller keyed on attacker-controlled input (e.g. the
    // chat/state token) could otherwise rotate keys to grow the map without
    // bound, and the sweep above only removes EXPIRED entries - so every request
    // across every endpoint (the map is shared) would pay an O(n) scan. Map
    // preserves insertion order, so the first key is the oldest; evicting it is
    // O(1). Worst case a flood resets honest callers' counters (fail-open),
    // which is preferable to a global slowdown.
    if (rateLimitMap.size >= MAX_ENTRIES) {
      const oldest = rateLimitMap.keys().next().value;
      if (oldest !== undefined) rateLimitMap.delete(oldest);
    }
    rateLimitMap.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

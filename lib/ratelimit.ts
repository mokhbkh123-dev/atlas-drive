/**
 * Best-effort in-memory sliding-window rate limiter.
 *
 * Works per server instance (single Node process / long-lived server).
 * On serverless (Vercel) each instance has its own counters — document this
 * limitation; for strict limits a shared store (Redis/Upstash) can replace
 * this module without changing callers.
 */

type Bucket = number[];

const buckets = new Map<string, Bucket>();

// Prevent unbounded growth.
const MAX_KEYS = 5000;

function sweep(now: number, windowMs: number) {
  if (buckets.size <= MAX_KEYS) return;
  for (const [key, hits] of buckets) {
    const alive = hits.filter((t) => t > now - windowMs);
    if (alive.length === 0) buckets.delete(key);
    else buckets.set(key, alive);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  sweep(now, windowMs);

  const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= limit) {
    const retryAfterMs = hits[0] + windowMs - now;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, retryAfterSec: 0 };
}

/** Clear a key after a successful login so failures alone count toward the limit. */
export function rateLimitReset(key: string): void {
  buckets.delete(key);
}

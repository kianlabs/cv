/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Scope: a single Node process. That is enough for a personal portfolio served
 * from one instance (local dev, a single VPS/container). It is NOT shared
 * across serverless invocations or multiple instances — if this is ever scaled
 * horizontally, swap the `buckets` Map for Redis/Upstash and keep the same API.
 */

interface Bucket {
  /** Timestamps (ms) of recent hits, oldest first. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

// Hard cap on distinct keys so a flood of spoofed IPs cannot grow the map
// without bound. When exceeded we evict the oldest-touched keys.
const MAX_KEYS = 5_000;

let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  buckets.forEach((bucket, key) => {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    if (bucket.hits.length === 0) buckets.delete(key);
  });
  if (buckets.size > MAX_KEYS) {
    // Map preserves insertion order — drop the oldest entries.
    const excess = buckets.size - MAX_KEYS;
    let i = 0;
    buckets.forEach((_bucket, key) => {
      if (i++ >= excess) return;
      buckets.delete(key);
    });
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Requests still allowed in the current window (0 when blocked). */
  remaining: number;
  /** Seconds until the client may retry (only meaningful when !ok). */
  retryAfterSec: number;
  limit: number;
}

/**
 * Record a hit for `key` and report whether it is within `limit` per `windowMs`.
 * Returns `ok: false` once the limit is exceeded.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  // Drop hits outside the window.
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - oldest)) / 1000),
    );
    return { ok: false, remaining: 0, retryAfterSec, limit };
  }

  bucket.hits.push(now);
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.hits.length),
    retryAfterSec: 0,
    limit,
  };
}

/** Best-effort client IP from common proxy headers, else a constant bucket. */
export function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    'unknown'
  );
}

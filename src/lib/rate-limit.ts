/**
 * A best-effort rate limit for the two POST routes — REVIEW.md R-15.
 *
 * Both are expensive in ways that are somebody else's quota: `POST
 * /api/submissions` writes to Firestore (20k writes/day on the free plan),
 * and `POST .../deep-dive` costs four Gemini generations (two tones x two languages), each of which can
 * retry across four models. Nothing stopped a script from looping either.
 *
 * **What this is, precisely.** An in-memory sliding window, per serverless
 * instance. It stops the naive case — one client hammering one endpoint,
 * which on a low-traffic app usually keeps landing on the same warm
 * instance — and it costs nothing: no new dependency, no new service, no
 * credentials for anyone to configure.
 *
 * **What it is not.** A distributed limit. Traffic spread across instances,
 * or a genuinely motivated attacker, walks through it. Closing that means a
 * shared store (Upstash Redis) or Vercel's firewall rules, both of which
 * need an account and a plan decision — recorded in REVIEW.md rather than
 * assumed. This is the honest floor, not the ceiling.
 *
 * Limits are deliberately generous: a false positive here means refusing to
 * score a real founder, which is far worse than serving a few extra
 * requests to someone curious.
 */

export interface RateLimitOptions {
  /** Requests allowed inside the window. */
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest request leaves the window — what to put in `Retry-After`. */
  retryAfterSeconds: number;
}

/** key -> timestamps (ms) of the requests still inside the window. */
const hits = new Map<string, number[]>();

/**
 * Keeps the map from growing without bound on a long-lived instance. Swept
 * lazily on write rather than on a timer: a serverless instance that stops
 * receiving requests should be free to freeze, not hold a live interval.
 */
const SWEEP_EVERY = 500;
let writesSinceSweep = 0;

function sweep(now: number, windowMs: number): void {
  for (const [key, timestamps] of hits) {
    const kept = timestamps.filter((t) => now - t < windowMs);
    if (kept.length === 0) hits.delete(key);
    else hits.set(key, kept);
  }
}

export function rateLimit(key: string, options: RateLimitOptions, now: number = Date.now()): RateLimitResult {
  const windowMs = options.windowSeconds * 1000;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= options.limit) {
    const oldest = recent[0] ?? now;
    hits.set(key, recent);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }

  recent.push(now);
  hits.set(key, recent);

  writesSinceSweep += 1;
  if (writesSinceSweep >= SWEEP_EVERY) {
    writesSinceSweep = 0;
    sweep(now, windowMs);
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * The caller's IP as Vercel reports it. `NextRequest.ip` was removed in
 * Next.js 15, so `x-forwarded-for`'s first entry is the supported way; the
 * platform sets it, and a client-supplied value can't override it there.
 *
 * Falls back to a single shared bucket when no IP is available: that makes
 * an unidentifiable caller share a limit with every other unidentifiable
 * caller, which is the conservative direction.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${scope}:${ip}`;
}

/** Test seam — the module-level map would otherwise leak between test cases. */
export function resetRateLimitsForTests(): void {
  hits.clear();
  writesSinceSweep = 0;
}

import { RATE_LIMITS } from "./constants";

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: { window: number; max: number } = RATE_LIMITS.API): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + limit.window });
    return { allowed: true, remaining: limit.max - 1, resetAt: now + limit.window };
  }

  entry.count++;

  if (entry.count > limit.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit.max - entry.count, resetAt: entry.resetAt };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

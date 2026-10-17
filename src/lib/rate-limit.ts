import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Limiteur en mémoire, par instance serveur. Suffisant pour freiner une attaque
 * par force brute sur un site à faible trafic ; pour une garantie globale sur
 * Vercel (plusieurs instances), compléter avec un WAF ou un store partagé.
 */
export function createRateLimiter(max: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  function sweep(now: number) {
    if (buckets.size < 1000) return;
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  return {
    isBlocked(key: string): boolean {
      const b = buckets.get(key);
      return !!b && b.count >= max && b.resetAt > Date.now();
    },
    hit(key: string): void {
      const now = Date.now();
      sweep(now);
      const b = buckets.get(key);
      if (!b || b.resetAt <= now) buckets.set(key, { count: 1, resetAt: now + windowMs });
      else b.count += 1;
    },
    reset(key: string): void {
      buckets.delete(key);
    },
  };
}

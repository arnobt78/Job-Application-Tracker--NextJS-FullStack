/**
 * Optional Upstash Redis read-through cache + cross-instance invalidation markers.
 * Graceful no-op when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are unset.
 */

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, opts?: { ex?: number }) => Promise<unknown>;
  del: (...keys: string[]) => Promise<unknown>;
};

let redisClient: RedisClient | null | undefined;

async function getRedis(): Promise<RedisClient | null> {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url, token }) as RedisClient;
    return redisClient;
  } catch {
    redisClient = null;
    return null;
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;

  try {
    const raw = await redis.get(key);
    if (raw == null) return null;
    return typeof raw === 'string' ? (JSON.parse(raw) as T) : (raw as T);
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch {
    // Redis unavailable — Prisma/cache components still serve data
  }
}

export async function deleteCacheKeys(...keys: string[]): Promise<void> {
  const redis = await getRedis();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(...keys);
  } catch {
    // no-op
  }
}

/** Cross-instance invalidation marker — SSE routes poll this key */
export type InvalidationMarker = {
  type: 'invalidate';
  jobId?: string;
  ts: number;
};

export function invalidationMarkerKey(userId: string): string {
  return `jobify:last-invalidate:${userId}`;
}

export async function setInvalidationMarker(
  userId: string,
  jobId?: string
): Promise<InvalidationMarker> {
  const marker: InvalidationMarker = {
    type: 'invalidate',
    jobId,
    ts: Date.now(),
  };
  await setCache(invalidationMarkerKey(userId), marker, 3600);
  return marker;
}

export async function getInvalidationMarker(
  userId: string
): Promise<InvalidationMarker | null> {
  return getCache<InvalidationMarker>(invalidationMarkerKey(userId));
}

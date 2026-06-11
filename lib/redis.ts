/**
 * Optional Upstash Redis — read-through cache + Redis Streams for cross-instance SSE pub/sub.
 * Graceful no-op when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are unset.
 */

import type { Redis } from '@upstash/redis';

let redisClient: Redis | null | undefined;

async function getRedis(): Promise<Redis | null> {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return null;
  }

  try {
    const { Redis: UpstashRedis } = await import('@upstash/redis');
    redisClient = new UpstashRedis({ url, token });
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
    const raw = await redis.get<string>(key);
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
    // Redis unavailable — Prisma/unstable_cache still serve data
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

/** Redis Stream key — one stream per user for invalidation events */
export function invalidationStreamKey(userId: string): string {
  return `jobify:invalidate-stream:${userId}`;
}

export type StreamInvalidationPayload = {
  id: string;
  jobId?: string;
  ts: number;
};

/**
 * XADD invalidation event — consumed by SSE via XREAD BLOCK (true pub/sub over Streams).
 * MAXLEN ~ keeps stream bounded for long-running deployments.
 */
export async function pushInvalidationStreamEvent(
  userId: string,
  jobId?: string
): Promise<StreamInvalidationPayload | null> {
  const redis = await getRedis();
  if (!redis) return null;

  const ts = Date.now();
  try {
    const id = await redis.xadd(invalidationStreamKey(userId), '*', {
      type: 'invalidate',
      jobId: jobId ?? '',
      ts: String(ts),
    });

    if (typeof id !== 'string') return null;

    // Trim stream to last ~100 events (approximate maxlen)
    await redis.xtrim(invalidationStreamKey(userId), {
      strategy: 'MAXLEN',
      threshold: 100,
      exactness: '~',
    });

    return { id, jobId, ts };
  } catch {
    return null;
  }
}

/**
 * XREAD BLOCK — waits up to blockMs for new invalidation events (replaces key polling).
 */
export async function readInvalidationStreamEvents(
  userId: string,
  lastId: string,
  blockMs = 5_000
): Promise<StreamInvalidationPayload[]> {
  const redis = await getRedis();
  if (!redis) return [];

  try {
    const result = await redis.xread(
      invalidationStreamKey(userId),
      lastId,
      { count: 10, blockMS: blockMs }
    );

    if (!result || !Array.isArray(result)) return [];

    const events: StreamInvalidationPayload[] = [];

    for (const entry of result) {
      const record = entry as {
        id: string;
        message: Record<string, string>;
      };
      if (!record?.id || !record.message) continue;

      events.push({
        id: record.id,
        jobId: record.message.jobId || undefined,
        ts: Number(record.message.ts) || Date.now(),
      });
    }

    return events;
  } catch {
    return [];
  }
}

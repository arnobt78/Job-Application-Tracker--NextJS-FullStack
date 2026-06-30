/**
 * Redis read-through keys for getCachedJobs etc.
 * invalidateUserRedisCaches must match these patterns — NOT cache tag names (jobs-${userId}).
 */

import type { Redis } from '@upstash/redis';

let redisClient: Redis | null | undefined;

async function getRedis(): Promise<Redis | null> {
  if (redisClient !== undefined) return redisClient;

  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_TOKEN;

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

/** @deprecated Prefer invalidateUserRedisCaches — keys must match query redisKey format */
export async function deleteCacheKeys(...keys: string[]): Promise<void> {
  const redis = await getRedis();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(...keys);
  } catch {
    // no-op
  }
}

/**
 * Fixed Redis keys written by lib/jobs/queries.ts for a user.
 * Includes the default dashboard list key (no filters, page 1, limit 10) so the most-read
 * key is always purged explicitly — Upstash SCAN can miss it under high-key-count conditions.
 * Key format mirrors getCachedJobs redisKey: `jobs:${userId}:${search}:${jobStatus}:${jobMode}:${monthYear}:${page}:${limit}`
 */
export function fixedUserRedisKeys(userId: string): string[] {
  return [
    `stats:${userId}`,
    `charts:${userId}`,
    `charts-weekly:${userId}`,
    `job-filter-options:${userId}`,
    // Default dashboard view — search='', jobStatus/jobMode/monthYear='all', page=1, limit=10
    `jobs:${userId}::all:all:all:1:10`,
  ];
}

/** SCAN patterns for paginated / per-job keys. */
export function scanUserRedisPatterns(userId: string): string[] {
  return [`jobs:${userId}:*`, `job:${userId}:*`];
}

/**
 * Purge all Upstash keys for a user after CRUD.
 * Previous bug: deleteCacheKeys used tag names (jobs-${userId}) not redisKey (jobs:${userId}:...).
 */
export async function invalidateUserRedisCaches(
  userId: string
): Promise<number> {
  const redis = await getRedis();
  if (!redis) return 0;

  const keys = new Set<string>(fixedUserRedisKeys(userId));

  try {
    for (const pattern of scanUserRedisPatterns(userId)) {
      let cursor = 0;
      do {
        const [nextCursor, found] = await redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        cursor =
          typeof nextCursor === 'number'
            ? nextCursor
            : parseInt(String(nextCursor), 10);
        for (const key of found) {
          if (typeof key === 'string') keys.add(key);
        }
      } while (cursor !== 0);
    }

    const list = Array.from(keys);
    if (list.length === 0) return 0;
    await redis.del(...list);
    return list.length;
  } catch {
    return 0;
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

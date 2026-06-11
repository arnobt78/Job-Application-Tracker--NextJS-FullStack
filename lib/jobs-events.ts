/**
 * Invalidation bus: in-memory (same instance) + Redis Streams (cross-instance SSE).
 * publishInvalidation is called from server actions after CRUD.
 */

import {
  pushInvalidationStreamEvent,
  readInvalidationStreamEvents,
  type StreamInvalidationPayload,
} from '@/lib/redis';

export type JobsInvalidationEvent = {
  type: 'invalidate';
  jobId?: string;
};

type Listener = (event: JobsInvalidationEvent) => void;

declare global {
  var __jobifyInvalidationListeners: Map<string, Set<Listener>> | undefined;
}

function getListenerMap(): Map<string, Set<Listener>> {
  if (!globalThis.__jobifyInvalidationListeners) {
    globalThis.__jobifyInvalidationListeners = new Map();
  }
  return globalThis.__jobifyInvalidationListeners;
}

/** Register SSE subscriber for a user — returns unsubscribe */
export function subscribeInvalidations(
  userId: string,
  listener: Listener
): () => void {
  const map = getListenerMap();
  if (!map.has(userId)) map.set(userId, new Set());
  map.get(userId)!.add(listener);

  return () => {
    map.get(userId)?.delete(listener);
    if (map.get(userId)?.size === 0) map.delete(userId);
  };
}

/** Notify in-memory subscribers + XADD to Redis Stream for other Vercel instances */
export async function publishInvalidation(
  userId: string,
  jobId?: string
): Promise<void> {
  const event: JobsInvalidationEvent = { type: 'invalidate', jobId };

  const listeners = getListenerMap().get(userId);
  listeners?.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // listener errors must not break CRUD
    }
  });

  await pushInvalidationStreamEvent(userId, jobId);
}

/**
 * Blocking read from Redis Stream — used by SSE route instead of interval polling.
 * Returns empty array when Redis is not configured (in-memory bus still works).
 */
export async function awaitRemoteInvalidations(
  userId: string,
  lastStreamId: string,
  blockMs = 5_000
): Promise<{ events: JobsInvalidationEvent[]; lastId: string }> {
  const payloads: StreamInvalidationPayload[] =
    await readInvalidationStreamEvents(userId, lastStreamId, blockMs);

  if (payloads.length === 0) {
    return { events: [], lastId: lastStreamId };
  }

  const lastId = payloads[payloads.length - 1]!.id;
  const events = payloads.map((p) => ({
    type: 'invalidate' as const,
    jobId: p.jobId,
  }));

  return { events, lastId };
}

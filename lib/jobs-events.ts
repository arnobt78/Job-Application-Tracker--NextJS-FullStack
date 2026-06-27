/**
 * Jobs event bus: in-memory (same instance) + Redis Streams (cross-instance SSE).
 *
 * Two event types share the same listener map:
 *   - 'invalidate' — triggers React Query cache flush (SSE + Redis Streams)
 *   - 'notify'    — enrichment alert (SSE only, in-memory; no Redis needed)
 *
 * Publishers:
 *   publishInvalidation — called from server actions after CRUD
 *   publishNotification — called from enrich.ts on detected status change
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

export type JobsNotificationEvent = {
  type: 'notify';
  notificationType: 'posting_closed' | 'jd_changed' | 'salary_added' | 'posting_reopened';
  jobId: string;
  message: string;
  timestamp: string;
};

/** Union of all server-push event types sent over the SSE stream */
export type JobsEvent = JobsInvalidationEvent | JobsNotificationEvent;

type Listener = (event: JobsEvent) => void;

declare global {
  var __jobifyEventListeners: Map<string, Set<Listener>> | undefined;
}

function getListenerMap(): Map<string, Set<Listener>> {
  if (!globalThis.__jobifyEventListeners) {
    globalThis.__jobifyEventListeners = new Map();
  }
  return globalThis.__jobifyEventListeners;
}

function dispatch(userId: string, event: JobsEvent): void {
  const listeners = getListenerMap().get(userId);
  listeners?.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // listener errors must not break CRUD or enrichment
    }
  });
}

/** Register SSE subscriber for a user — handles both invalidation + notification events */
export function subscribeJobsEvents(
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
  dispatch(userId, event);
  await pushInvalidationStreamEvent(userId, jobId);
}

/**
 * Publish a real-time enrichment notification — in-memory only.
 * Notifications go to the currently-connected SSE client; no Redis cross-instance
 * needed because the enrichment `after()` call runs on the same Vercel instance
 * that holds the user's active SSE connection via sticky routing.
 */
export async function publishNotification(
  userId: string,
  notificationType: JobsNotificationEvent['notificationType'],
  jobId: string,
  message: string
): Promise<void> {
  const event: JobsNotificationEvent = {
    type: 'notify',
    notificationType,
    jobId,
    message,
    timestamp: new Date().toISOString(),
  };
  dispatch(userId, event);
}

/**
 * Blocking read from Redis Stream — used by SSE route instead of interval polling.
 * Only invalidation events are stored in Redis (notifications are in-memory only).
 * Returns empty array when Redis is not configured (in-memory bus still works).
 */
export async function awaitRemoteJobsEvents(
  userId: string,
  lastStreamId: string,
  blockMs = 5_000
): Promise<{ events: JobsEvent[]; lastId: string }> {
  const payloads: StreamInvalidationPayload[] =
    await readInvalidationStreamEvents(userId, lastStreamId, blockMs);

  if (payloads.length === 0) {
    return { events: [], lastId: lastStreamId };
  }

  const lastId = payloads[payloads.length - 1]!.id;
  const events: JobsEvent[] = payloads.map((p) => ({
    type: 'invalidate' as const,
    jobId: p.jobId,
  }));

  return { events, lastId };
}

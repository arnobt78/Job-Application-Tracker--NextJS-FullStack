/**
 * In-memory invalidation bus for SSE (same instance) + Redis marker for cross-instance.
 * publishInvalidation is called from server actions after CRUD.
 */

import {
  getInvalidationMarker,
  setInvalidationMarker,
  type InvalidationMarker,
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

/** Notify in-memory subscribers + persist Redis marker for other Vercel instances */
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

  await setInvalidationMarker(userId, jobId);
}

/** Poll Redis for invalidation events from other serverless instances */
export async function pollRemoteInvalidation(
  userId: string,
  lastTs: number
): Promise<{ event: JobsInvalidationEvent; ts: number } | null> {
  const marker = await getInvalidationMarker(userId);
  if (!marker || marker.ts <= lastTs) return null;

  return {
    event: { type: 'invalidate', jobId: marker.jobId },
    ts: marker.ts,
  };
}

export type { InvalidationMarker };

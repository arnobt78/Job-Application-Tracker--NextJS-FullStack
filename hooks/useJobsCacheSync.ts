'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import {
  invalidateAllJobQueries,
  JOBS_CACHE_CHANNEL,
  type JobsCacheMessage,
} from '@/lib/invalidate-jobs';
import type { JobsNotificationEvent } from '@/lib/jobs-events';

const SSE_URL = '/api/jobs/events';
const SSE_RECONNECT_BASE_MS = 2_000;
const SSE_RECONNECT_MAX_MS = 30_000;

/**
 * BroadcastChannel name for relaying SSE 'notify' events to NotificationsProvider.
 * useJobsCacheSync posts to this channel; NotificationsProvider subscribes to it.
 * BroadcastChannel delivers to other instances in the same tab — no second SSE needed.
 */
export const NOTIFICATIONS_CHANNEL = 'jobify-notifications';

/** Listens for SSE + BroadcastChannel invalidation — refreshes React Query without page reload.
 *  Also relays enrichment notification events to NOTIFICATIONS_CHANNEL BroadcastChannel. */
export function useJobsCacheSync(): void {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    if (!isSignedIn) return;

    const invalidateFromExternal = (jobId?: string) => {
      invalidateAllJobQueries(queryClient, jobId, { broadcast: false });
    };

    const relayNotification = (event: JobsNotificationEvent) => {
      if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
      try {
        const bc = new BroadcastChannel(NOTIFICATIONS_CHANNEL);
        bc.postMessage(event);
        bc.close();
      } catch {
        // BroadcastChannel unavailable — notification silently dropped
      }
    };

    let bc: BroadcastChannel | null = null;
    let bcHandler: ((event: MessageEvent<JobsCacheMessage>) => void) | null =
      null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel(JOBS_CACHE_CHANNEL);
      bcHandler = (event: MessageEvent<JobsCacheMessage>) => {
        if (event.data?.type === 'invalidate') {
          invalidateFromExternal(event.data.jobId);
        }
      };
      bc.addEventListener('message', bcHandler);
    }

    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connectSse = () => {
      eventSource?.close();
      eventSource = new EventSource(SSE_URL);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as { type: string; jobId?: string };
          if (data.type === 'invalidate') {
            invalidateFromExternal(data.jobId);
          } else if (data.type === 'notify') {
            // Relay enrichment notifications to NotificationsProvider via BroadcastChannel
            relayNotification(data as JobsNotificationEvent);
          }
        } catch {
          // ignore malformed SSE payloads
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;
        const delay = Math.min(
          SSE_RECONNECT_BASE_MS * 2 ** reconnectAttempt.current,
          SSE_RECONNECT_MAX_MS
        );
        reconnectAttempt.current += 1;
        reconnectTimer = setTimeout(connectSse, delay);
      };

      eventSource.onopen = () => {
        reconnectAttempt.current = 0;
      };
    };

    connectSse();

    return () => {
      if (bc && bcHandler) {
        bc.removeEventListener('message', bcHandler);
        bc.close();
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
      eventSource?.close();
    };
  }, [isSignedIn, queryClient]);
}

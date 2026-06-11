'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import {
  invalidateAllJobQueries,
  JOBS_CACHE_CHANNEL,
  type JobsCacheMessage,
} from '@/lib/invalidate-jobs';

const SSE_URL = '/api/jobs/events';
const SSE_RECONNECT_BASE_MS = 2_000;
const SSE_RECONNECT_MAX_MS = 30_000;

/** Listens for SSE + BroadcastChannel invalidation — refreshes React Query without page reload */
export function useJobsCacheSync(): void {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    if (!isSignedIn) return;

    const invalidateFromExternal = (jobId?: string) => {
      invalidateAllJobQueries(queryClient, jobId, { broadcast: false });
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
          const data = JSON.parse(event.data) as JobsCacheMessage;
          if (data.type === 'invalidate') {
            invalidateFromExternal(data.jobId);
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

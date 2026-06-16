'use client';

import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

/** BroadcastChannel name for cross-tab cache sync after mutations */
export const JOBS_CACHE_CHANNEL = 'jobify-cache';

export type JobsCacheMessage = { type: 'invalidate'; jobId?: string };

export type InvalidateOptions = {
  /** Set false when handling SSE/BC events to avoid ping-pong broadcasts */
  broadcast?: boolean;
};

/** Notify other browser tabs to refresh React Query caches */
export function broadcastJobsInvalidation(jobId?: string): void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
  try {
    const channel = new BroadcastChannel(JOBS_CACHE_CHANNEL);
    channel.postMessage({ type: 'invalidate', jobId } satisfies JobsCacheMessage);
    channel.close();
  } catch {
    // BroadcastChannel unavailable — client invalidation still runs in current tab
  }
}

/** Invalidate all job-related queries in the current React Query client */
export function invalidateAllJobQueries(
  queryClient: QueryClient,
  jobId?: string,
  options: InvalidateOptions = {}
): void {
  const { broadcast = true } = options;

  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.charts.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.filterOptions });
  if (jobId) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.job.detail(jobId),
    });
  }
  if (broadcast) {
    broadcastJobsInvalidation(jobId);
  }
}

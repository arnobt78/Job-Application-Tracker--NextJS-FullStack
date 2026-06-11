import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  invalidateAllJobQueries,
  JOBS_CACHE_CHANNEL,
} from '@/lib/invalidate-jobs';
import { queryKeys } from '@/lib/query-keys';

describe('invalidateAllJobQueries', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.spyOn(queryClient, 'invalidateQueries');
  });

  it('invalidates jobs, stats, and charts query roots', () => {
    invalidateAllJobQueries(queryClient, undefined, { broadcast: false });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.jobs.all,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.stats.all,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.charts.all,
    });
  });

  it('invalidates job detail when jobId is provided', () => {
    invalidateAllJobQueries(queryClient, 'job-123', { broadcast: false });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.job.detail('job-123'),
    });
  });

  it('broadcasts via BroadcastChannel when broadcast is true', () => {
    const postMessage = vi.fn();
    const close = vi.fn();
    vi.stubGlobal(
      'BroadcastChannel',
      class {
        postMessage = postMessage;
        close = close;
      }
    );

    invalidateAllJobQueries(queryClient, 'job-1');

    expect(postMessage).toHaveBeenCalledWith({
      type: 'invalidate',
      jobId: 'job-1',
    });
    expect(close).toHaveBeenCalled();
  });

  it('skips broadcast when broadcast option is false', () => {
    const postMessage = vi.fn();
    vi.stubGlobal(
      'BroadcastChannel',
      class {
        postMessage = postMessage;
        close = vi.fn();
      }
    );

    invalidateAllJobQueries(queryClient, undefined, { broadcast: false });
    expect(postMessage).not.toHaveBeenCalled();
  });
});

describe('JOBS_CACHE_CHANNEL', () => {
  it('uses stable channel name for cross-tab sync', () => {
    expect(JOBS_CACHE_CHANNEL).toBe('jobify-cache');
  });
});

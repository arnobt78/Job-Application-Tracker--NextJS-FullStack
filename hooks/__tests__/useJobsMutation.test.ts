import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { JobsListResult } from '@/lib/jobs/queries';

/** Mirrors optimistic list patch logic from useDeleteJobMutation */
function optimisticRemoveJob(
  queryClient: QueryClient,
  jobId: string
): JobsListResult | undefined {
  let snapshot: JobsListResult | undefined;
  queryClient.setQueriesData<JobsListResult>(
    { queryKey: queryKeys.jobs.all },
    (old) => {
      if (!old) return old;
      snapshot = old;
      return {
        ...old,
        jobs: old.jobs.filter((j) => j.id !== jobId),
        count: Math.max(0, old.count - 1),
      };
    }
  );
  return snapshot;
}

describe('optimistic mutation rollback', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('removes job from list cache optimistically', () => {
    const listKey = queryKeys.jobs.list('', 'all', 'all', 'all', 1);
    queryClient.setQueryData<JobsListResult>(listKey, {
      jobs: [
        {
          id: 'job-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          clerkId: 'u1',
          position: 'Dev',
          company: 'Co',
          location: 'Remote',
          status: 'pending',
          mode: 'full-time',
        },
      ],
      count: 1,
      page: 1,
      totalPages: 1,
    });

    optimisticRemoveJob(queryClient, 'job-1');

    const updated = queryClient.getQueryData<JobsListResult>(listKey);
    expect(updated?.jobs).toHaveLength(0);
    expect(updated?.count).toBe(0);
  });

  it('restores snapshot on rollback after failed delete', () => {
    const listKey = queryKeys.jobs.list('', 'all', 'all', 'all', 1);
    const original: JobsListResult = {
      jobs: [
        {
          id: 'job-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          clerkId: 'u1',
          position: 'Dev',
          company: 'Co',
          location: 'Remote',
          status: 'pending',
          mode: 'full-time',
        },
      ],
      count: 1,
      page: 1,
      totalPages: 1,
    };
    queryClient.setQueryData(listKey, original);

    const snapshot = optimisticRemoveJob(queryClient, 'job-1');
    expect(queryClient.getQueryData(listKey)).not.toEqual(original);

    queryClient.setQueryData(listKey, snapshot);
    expect(queryClient.getQueryData(listKey)).toEqual(original);
  });
});

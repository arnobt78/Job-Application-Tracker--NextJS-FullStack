/**
 * Client-side jobs list cache helpers.
 * jobs.all prefix also matches filter-options — always guard with isJobsListResult.
 */
import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { JobsListResult } from '@/lib/jobs/queries';
import type { JobType } from '@/utils/types';

export type JobsListCache = JobsListResult | undefined;

/** Default dashboard list key — matches SSR prefetch + useJobsListQuery with no filters. */
export const DEFAULT_JOBS_LIST_KEY = queryKeys.jobs.list(
  '',
  'all',
  'all',
  'all',
  1
);

export function isJobsListResult(data: unknown): data is JobsListResult {
  return (
    !!data &&
    typeof data === 'object' &&
    Array.isArray((data as JobsListResult).jobs)
  );
}

export function isJobsListQueryKey(key: readonly unknown[]): boolean {
  return key[0] === 'jobs' && key[1] !== 'filter-options';
}

export function jobsListQueryFilter() {
  return {
    queryKey: queryKeys.jobs.all,
    predicate: (query: { queryKey: readonly unknown[] }) =>
      isJobsListQueryKey(query.queryKey),
  };
}

function jobAlreadyInList(jobs: JobType[], job: JobType): boolean {
  return jobs.some(
    (j) =>
      j.id === job.id ||
      (!!job.bluedoorJobId && j.bluedoorJobId === job.bluedoorJobId)
  );
}

/** Merge server job into a list result — strips optimistic placeholders. */
export function mergeJobIntoListResult(
  old: JobsListResult,
  job: JobType
): JobsListResult {
  const withoutPlaceholders = old.jobs.filter(
    (j) => !j.id.startsWith('optimistic-') && j.id !== job.id
  );
  if (jobAlreadyInList(withoutPlaceholders, job)) {
    return { ...old, jobs: withoutPlaceholders, count: withoutPlaceholders.length };
  }
  const jobs = [job, ...withoutPlaceholders];
  return {
    ...old,
    jobs,
    count: Math.max(old.count ?? 0, jobs.length),
  };
}

/**
 * After create/track succeeds — write real job into list caches.
 * Seeds default dashboard key when cold (e.g. user tracked from /discover).
 */
export function commitCreatedJobToClientCache(
  queryClient: QueryClient,
  job: JobType
): void {
  queryClient.setQueriesData<JobsListCache>(
    jobsListQueryFilter(),
    (old) => (isJobsListResult(old) ? mergeJobIntoListResult(old, job) : old)
  );

  queryClient.setQueryData<JobsListCache>(DEFAULT_JOBS_LIST_KEY, (old) => {
    if (isJobsListResult(old)) return mergeJobIntoListResult(old, job);
    return { jobs: [job], count: 1, page: 1, totalPages: 1 };
  });
}

export function optimisticPrependJobList(
  queryClient: QueryClient,
  optimisticJob: JobType
): void {
  queryClient.setQueriesData<JobsListCache>(
    jobsListQueryFilter(),
    (old) => {
      if (!isJobsListResult(old)) return old;
      return {
        ...old,
        jobs: [optimisticJob, ...old.jobs],
        count: (old.count ?? old.jobs.length) + 1,
      };
    }
  );
}

export function optimisticPatchJobInLists(
  queryClient: QueryClient,
  jobId: string,
  patch: Partial<JobType>
): void {
  queryClient.setQueriesData<JobsListCache>(
    jobsListQueryFilter(),
    (old) => {
      if (!isJobsListResult(old)) return old;
      return {
        ...old,
        jobs: old.jobs.map((j) =>
          j.id === jobId ? { ...j, ...patch, updatedAt: new Date() } : j
        ),
      };
    }
  );
}

export function optimisticRemoveJobFromLists(
  queryClient: QueryClient,
  jobId: string
): JobType | undefined {
  let removedJob: JobType | undefined;

  queryClient.setQueriesData<JobsListCache>(
    jobsListQueryFilter(),
    (old) => {
      if (!isJobsListResult(old)) return old;
      const removed = old.jobs.find((j) => j.id === jobId);
      removedJob = removed;
      return {
        ...old,
        jobs: old.jobs.filter((j) => j.id !== jobId),
        count: Math.max(0, (old.count ?? old.jobs.length) - 1),
      };
    }
  );

  return removedJob;
}

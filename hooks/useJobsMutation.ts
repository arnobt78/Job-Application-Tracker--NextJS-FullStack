'use client';

import {
  createJobAction,
  deleteJobAction,
  getAllJobsAction,
  getStatsAction,
  trackJobFromDiscoverAction,
  updateJobAction,
} from '@/utils/actions';
import { JobStatus, JobMode, type CreateAndEditJobType, type JobType } from '@/utils/types';
import { queryKeys } from '@/lib/query-keys';
import { invalidateAllJobQueries } from '@/lib/invalidate-jobs';
import {
  notifyAlreadyTracked,
  notifyJobCreateError,
  notifyJobCreated,
  notifyJobDeleted,
  notifyJobDeleteError,
  notifyJobUpdated,
  notifyJobUpdateError,
} from '@/lib/notifications/app-toast';
import { trackEvent } from '@/lib/analytics/posthog';
import {
  commitCreatedJobToClientCache,
  DEFAULT_JOBS_LIST_KEY,
  isJobsListResult,
  optimisticPatchJobInLists,
  optimisticPrependJobList,
  optimisticRemoveJobFromLists,
  type JobsListCache,
} from '@/lib/jobs/list-cache';
import {
  bumpChartMonth,
  type ChartsCache,
} from '@/lib/jobs/chart-optimistic';
import {
  applyStatsCreate,
  applyStatsDelete,
  applyStatsUpdate,
  type StatsCache,
} from '@/lib/jobs/stats-optimistic';
import {
  resolveDiscoverCompanyName,
  type DiscoverTrackPayload,
} from '@/lib/discover/track-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_JOBS_LIST_FILTERS } from '@/lib/jobs/filter-types';

/**
 * Force-fetch default dashboard queries after create/track.
 * Uses a stale guard: if server returns a lower count than what the client already has
 * (e.g. Redis not yet purged), keep the client-side merged result from commitCreatedJobToClientCache.
 */
function warmDashboardJobsCaches(
  queryClient: ReturnType<typeof useQueryClient>
): void {
  const listParams = {
    search: DEFAULT_JOBS_LIST_FILTERS.search,
    jobStatus: DEFAULT_JOBS_LIST_FILTERS.jobStatus,
    jobMode: DEFAULT_JOBS_LIST_FILTERS.jobMode,
    monthYear: DEFAULT_JOBS_LIST_FILTERS.monthYear,
    page: DEFAULT_JOBS_LIST_FILTERS.page,
  };

  void queryClient
    .fetchQuery({
      queryKey: DEFAULT_JOBS_LIST_KEY,
      queryFn: () => getAllJobsAction(listParams),
    })
    .then((result) => {
      // Never let a stale server response regress the count that commitCreatedJobToClientCache set
      queryClient.setQueryData<JobsListCache>(DEFAULT_JOBS_LIST_KEY, (old) => {
        if (!isJobsListResult(result)) return result;
        if (!isJobsListResult(old)) return result;
        if (result.count < old.count) return old;
        return result;
      });
    });

  void queryClient.fetchQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
  });
}

/** Unwrap JobActionResult — throws so TanStack onError + toast fire on failure. */
async function unwrapJobActionResult(
  result: Awaited<ReturnType<typeof createJobAction>>,
  fallbackLabel: string
): Promise<JobType> {
  if (!result.success) {
    throw new Error(result.error || fallbackLabel);
  }
  return result.job;
}

/** Shared post-mutation invalidation — busts all job queries + cross-tab broadcast */
export function useJobsInvalidation() {
  const queryClient = useQueryClient();

  const invalidateAfterMutation = (jobId?: string) => {
    invalidateAllJobQueries(queryClient, jobId);
  };

  return { invalidateAfterMutation, queryClient };
}

/** Create job — optimistic prepend to lists + stats + charts bump */
export function useCreateJobMutation() {
  const queryClient = useQueryClient();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: async (values: CreateAndEditJobType) =>
      unwrapJobActionResult(
        await createJobAction(values),
        'Could not add application'
      ),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.stats.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.charts.all });

      const previousJobs = queryClient.getQueriesData<JobsListCache>({
        queryKey: queryKeys.jobs.all,
      });
      const previousStats = queryClient.getQueryData<StatsCache>(
        queryKeys.stats.all
      );
      const previousCharts = queryClient.getQueryData<ChartsCache>(
        queryKeys.charts.all
      );

      const now = new Date();
      const optimisticJob: JobType = {
        id: `optimistic-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        userId: '',
        ...values,
      };

      optimisticPrependJobList(queryClient, optimisticJob);

      queryClient.setQueryData<StatsCache>(queryKeys.stats.all, (old) =>
        applyStatsCreate(old, values)
      );

      queryClient.setQueryData<ChartsCache>(queryKeys.charts.all, (old) =>
        bumpChartMonth(old, now, 1)
      );

      return { previousJobs, previousStats, previousCharts };
    },
    onError: (err, values, context) => {
      context?.previousJobs.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
      }
      if (context?.previousCharts !== undefined) {
        queryClient.setQueryData(queryKeys.charts.all, context.previousCharts);
      }
      const detail =
        err instanceof Error && err.message ? err.message : undefined;
      notifyJobCreateError(values.position, values.company, detail);
    },
    onSuccess: (data) => {
      commitCreatedJobToClientCache(queryClient, data);
      notifyJobCreated(data);
      invalidateAfterMutation(data.id);
      warmDashboardJobsCaches(queryClient);
      trackEvent('job_created', { status: data.status, mode: data.mode });
    },
    onSettled: (data) => {
      invalidateAllJobQueries(queryClient, data?.id ?? undefined, {
        broadcast: false,
      });
    },
  });
}

/**
 * Track a Bluedoor posting from /discover — pre-seeds enrichment + idempotent by bluedoorJobId.
 * Shares optimistic invalidation pattern with useCreateJobMutation.
 *
 * Idempotent path (same posting re-tracked):
 *   - Server returns alreadyTracked:true with the existing job
 *   - onSuccess rolls back the optimistic +1 and shows "Already tracking" toast
 *   - No invalidation fires — cache is unchanged (correct)
 */
export function useTrackDiscoverJobMutation() {
  const queryClient = useQueryClient();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: async (payload: DiscoverTrackPayload) => {
      const result = await trackJobFromDiscoverAction(payload);
      if (!result.success) throw new Error(result.error || 'Could not track application');
      return { job: result.job, alreadyTracked: result.alreadyTracked ?? false };
    },
    onMutate: async (payload) => {
      const values: CreateAndEditJobType = {
        position: payload.title,
        company: resolveDiscoverCompanyName(payload.orgId, payload.applyUrl),
        location: payload.locationText ?? payload.country ?? 'Unknown',
        status: JobStatus.Pending,
        mode: JobMode.FullTime,
        applyUrl: payload.applyUrl,
      };

      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.stats.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.charts.all });

      const previousJobs = queryClient.getQueriesData<JobsListCache>({
        queryKey: queryKeys.jobs.all,
      });
      const previousStats = queryClient.getQueryData<StatsCache>(
        queryKeys.stats.all
      );
      const previousCharts = queryClient.getQueryData<ChartsCache>(
        queryKeys.charts.all
      );

      const now = new Date();
      const optimisticJob: JobType = {
        id: `optimistic-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        userId: '',
        ...values,
        bluedoorJobId: payload.jobId,
      };

      optimisticPrependJobList(queryClient, optimisticJob);

      queryClient.setQueryData<StatsCache>(queryKeys.stats.all, (old) =>
        applyStatsCreate(old, values)
      );

      queryClient.setQueryData<ChartsCache>(queryKeys.charts.all, (old) =>
        bumpChartMonth(old, now, 1)
      );

      return { previousJobs, previousStats, previousCharts, values };
    },
    onError: (err, payload, context) => {
      context?.previousJobs.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
      }
      if (context?.previousCharts !== undefined) {
        queryClient.setQueryData(queryKeys.charts.all, context.previousCharts);
      }
      const detail =
        err instanceof Error && err.message ? err.message : undefined;
      notifyJobCreateError(
        payload.title,
        context?.values.company ?? payload.orgId,
        detail
      );
    },
    onSuccess: ({ job, alreadyTracked }, _payload, context) => {
      if (alreadyTracked) {
        // Roll back the optimistic +1 — no new row was created
        context?.previousJobs.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        if (context?.previousStats !== undefined) {
          queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
        }
        if (context?.previousCharts !== undefined) {
          queryClient.setQueryData(queryKeys.charts.all, context.previousCharts);
        }
        notifyAlreadyTracked(job);
        return;
      }

      commitCreatedJobToClientCache(queryClient, job);
      notifyJobCreated(job);
      invalidateAfterMutation(job.id);
      warmDashboardJobsCaches(queryClient);
      trackEvent('job_created', {
        status: job.status,
        mode: job.mode,
        source: 'discover',
      });
    },
    onSettled: (data) => {
      // Skip invalidation for idempotent returns — cache was already rolled back in onSuccess
      if (data?.alreadyTracked) return;
      invalidateAllJobQueries(queryClient, data?.job.id ?? undefined, {
        broadcast: false,
      });
    },
  });
}

/** Update job — optimistic patch in detail + list + stats (charts unchanged unless date edits) */
export function useUpdateJobMutation(jobId: string) {
  const queryClient = useQueryClient();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: (values: CreateAndEditJobType) =>
      updateJobAction(jobId, values),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });
      await queryClient.cancelQueries({
        queryKey: queryKeys.job.detail(jobId),
      });
      await queryClient.cancelQueries({ queryKey: queryKeys.stats.all });

      const previousJobs = queryClient.getQueriesData<JobsListCache>({
        queryKey: queryKeys.jobs.all,
      });
      const previousDetail = queryClient.getQueryData<JobType>(
        queryKeys.job.detail(jobId)
      );
      const previousStats = queryClient.getQueryData<StatsCache>(
        queryKeys.stats.all
      );

      const jobInList = previousJobs
        .map(([, data]) =>
          isJobsListResult(data) ? data.jobs.find((j) => j.id === jobId) : undefined
        )
        .find((j): j is JobType => j !== undefined);

      const oldStatus = previousDetail?.status ?? jobInList?.status;
      const oldMode = previousDetail?.mode ?? jobInList?.mode;

      queryClient.setQueryData<JobType>(queryKeys.job.detail(jobId), (old) =>
        old ? { ...old, ...values, updatedAt: new Date() } : old
      );

      optimisticPatchJobInLists(queryClient, jobId, values);

      if (
        (oldStatus && oldStatus !== values.status) ||
        (oldMode && oldMode !== values.mode)
      ) {
        queryClient.setQueryData<StatsCache>(queryKeys.stats.all, (old) =>
          applyStatsUpdate(
            old,
            { status: oldStatus, mode: oldMode },
            values
          )
        );
      }

      return { previousJobs, previousDetail, previousStats };
    },
    onError: (_err, values, context) => {
      context?.previousJobs.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(
          queryKeys.job.detail(jobId),
          context.previousDetail
        );
      }
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
      }
      notifyJobUpdateError(values.position, values.company);
    },
    onSuccess: (result) => {
      if (!result) return;
      notifyJobUpdated(result);
      invalidateAfterMutation(jobId);
      trackEvent('job_updated', { status: result.status, mode: result.mode });
    },
    onSettled: () => {
      invalidateAllJobQueries(queryClient, jobId, { broadcast: false });
    },
  });
}

/** Delete job — optimistic remove from lists + stats + charts decrement */
export function useDeleteJobMutation(jobId: string) {
  const queryClient = useQueryClient();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: () => deleteJobAction(jobId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.stats.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.charts.all });

      const previousJobs = queryClient.getQueriesData<JobsListCache>({
        queryKey: queryKeys.jobs.all,
      });
      const previousStats = queryClient.getQueryData<StatsCache>(
        queryKeys.stats.all
      );
      const previousCharts = queryClient.getQueryData<ChartsCache>(
        queryKeys.charts.all
      );

      let removedJob: JobType | undefined;
      let removedCreatedAt: Date | undefined;

      const removed = optimisticRemoveJobFromLists(queryClient, jobId);
      removedJob = removed;
      removedCreatedAt = removed?.createdAt
        ? new Date(removed.createdAt)
        : undefined;

      if (removedJob) {
        queryClient.setQueryData<StatsCache>(queryKeys.stats.all, (old) =>
          applyStatsDelete(old, removedJob!)
        );
      }

      if (removedCreatedAt) {
        queryClient.setQueryData<ChartsCache>(queryKeys.charts.all, (old) =>
          bumpChartMonth(old, removedCreatedAt!, -1)
        );
      }

      return { previousJobs, previousStats, previousCharts, removedJob };
    },
    onError: (_err, _vars, context) => {
      context?.previousJobs.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
      }
      if (context?.previousCharts !== undefined) {
        queryClient.setQueryData(queryKeys.charts.all, context.previousCharts);
      }
      const removed = context?.removedJob;
      notifyJobDeleteError(
        removed?.position ?? 'Application',
        removed?.company ?? 'Unknown company'
      );
    },
    onSuccess: (data) => {
      if (!data) return;
      invalidateAfterMutation(jobId);
      notifyJobDeleted(data);
      trackEvent('job_deleted', { status: data.status });
    },
    onSettled: () => {
      invalidateAllJobQueries(queryClient, jobId, { broadcast: false });
    },
  });
}

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

/** Prefetch default dashboard queries after create/track — warms cache before navigation. */
function warmDashboardJobsCaches(
  queryClient: ReturnType<typeof useQueryClient>
): void {
  void queryClient.prefetchQuery({
    queryKey: DEFAULT_JOBS_LIST_KEY,
    queryFn: () => getAllJobsAction({ page: 1 }),
  });
  void queryClient.prefetchQuery({
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
 */
export function useTrackDiscoverJobMutation() {
  const queryClient = useQueryClient();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: async (payload: DiscoverTrackPayload) =>
      unwrapJobActionResult(
        await trackJobFromDiscoverAction(payload),
        'Could not track application'
      ),
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
    onSuccess: (data) => {
      commitCreatedJobToClientCache(queryClient, data);
      notifyJobCreated(data);
      invalidateAfterMutation(data.id);
      warmDashboardJobsCaches(queryClient);
      trackEvent('job_created', {
        status: data.status,
        mode: data.mode,
        source: 'discover',
      });
    },
    onSettled: (data) => {
      invalidateAllJobQueries(queryClient, data?.id ?? undefined, {
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

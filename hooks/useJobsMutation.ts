'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createJobAction,
  deleteJobAction,
  updateJobAction,
} from '@/utils/actions';
import type { CreateAndEditJobType, JobType } from '@/utils/types';
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
import type { JobsListResult } from '@/lib/jobs/queries';
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

type JobsListCache = JobsListResult | undefined;

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
    mutationFn: (values: CreateAndEditJobType) => createJobAction(values),
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

      queryClient.setQueriesData<JobsListCache>(
        { queryKey: queryKeys.jobs.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            jobs: [optimisticJob, ...old.jobs],
            count: old.count + 1,
          };
        }
      );

      queryClient.setQueryData<StatsCache>(queryKeys.stats.all, (old) =>
        applyStatsCreate(old, values)
      );

      queryClient.setQueryData<ChartsCache>(queryKeys.charts.all, (old) =>
        bumpChartMonth(old, now, 1)
      );

      return { previousJobs, previousStats, previousCharts };
    },
    onError: (_err, values, context) => {
      context?.previousJobs.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
      }
      if (context?.previousCharts !== undefined) {
        queryClient.setQueryData(queryKeys.charts.all, context.previousCharts);
      }
      notifyJobCreateError(values.position, values.company);
    },
    onSuccess: (data) => {
      if (!data) return;
      notifyJobCreated(data);
      invalidateAfterMutation(data.id);
      trackEvent('job_created', { status: data.status, mode: data.mode });
      // No navigation — Add Job is a dialog on /dashboard; caller handles close via mutate() onSuccess callback
    },
    onSettled: (data) => {
      // Full bust incl. filterOptions — no second cross-tab ping (onSuccess already broadcast)
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
        .map(([, data]) => data?.jobs.find((j) => j.id === jobId))
        .find((j): j is JobType => j !== undefined);

      const oldStatus = previousDetail?.status ?? jobInList?.status;
      const oldMode = previousDetail?.mode ?? jobInList?.mode;

      queryClient.setQueryData<JobType>(queryKeys.job.detail(jobId), (old) =>
        old ? { ...old, ...values, updatedAt: new Date() } : old
      );

      queryClient.setQueriesData<JobsListCache>(
        { queryKey: queryKeys.jobs.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            jobs: old.jobs.map((j) =>
              j.id === jobId ? { ...j, ...values, updatedAt: new Date() } : j
            ),
          };
        }
      );

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

      queryClient.setQueriesData<JobsListCache>(
        { queryKey: queryKeys.jobs.all },
        (old) => {
          if (!old) return old;
          const removed = old.jobs.find((j) => j.id === jobId);
          removedJob = removed;
          removedCreatedAt = removed?.createdAt
            ? new Date(removed.createdAt)
            : undefined;
          return {
            ...old,
            jobs: old.jobs.filter((j) => j.id !== jobId),
            count: Math.max(0, old.count - 1),
          };
        }
      );

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

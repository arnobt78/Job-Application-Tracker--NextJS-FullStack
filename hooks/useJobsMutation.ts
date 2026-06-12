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
import type { JobsListResult, StatsResult } from '@/lib/jobs/queries';
import {
  bumpChartMonth,
  type ChartsCache,
} from '@/lib/jobs/chart-optimistic';

type JobsListCache = JobsListResult | undefined;
type StatsCache = StatsResult | undefined;

/** Shared post-mutation invalidation — busts all job queries + cross-tab broadcast */
export function useJobsInvalidation() {
  const queryClient = useQueryClient();

  const invalidateAfterMutation = (jobId?: string) => {
    invalidateAllJobQueries(queryClient, jobId);
  };

  return { invalidateAfterMutation, queryClient };
}

function bumpStat(stats: StatsCache, status: string, delta: number): StatsCache {
  if (!stats) return stats;
  const key = status.toLowerCase() as keyof StatsResult;
  if (!(key in stats)) return stats;
  return { ...stats, [key]: Math.max(0, (stats[key] ?? 0) + delta) };
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
        clerkId: '',
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
        bumpStat(old, values.status, 1)
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
      // No navigation — Add Job is a dialog on /dashboard; caller handles close via mutate() onSuccess callback
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.charts.all });
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

      const oldStatus = previousDetail?.status;

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

      if (oldStatus && oldStatus !== values.status) {
        queryClient.setQueryData<StatsCache>(queryKeys.stats.all, (old) => {
          let next = bumpStat(old, oldStatus, -1);
          next = bumpStat(next, values.status, 1);
          return next;
        });
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
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.charts.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.job.detail(jobId),
      });
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

      let removedStatus: string | undefined;
      let removedCreatedAt: Date | undefined;
      let removedJob: JobType | undefined;

      queryClient.setQueriesData<JobsListCache>(
        { queryKey: queryKeys.jobs.all },
        (old) => {
          if (!old) return old;
          const removed = old.jobs.find((j) => j.id === jobId);
          removedJob = removed;
          removedStatus = removed?.status;
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

      if (removedStatus) {
        queryClient.setQueryData<StatsCache>(queryKeys.stats.all, (old) =>
          bumpStat(old, removedStatus!, -1)
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
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.charts.all });
    },
  });
}

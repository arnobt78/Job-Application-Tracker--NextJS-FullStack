'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createJobAction,
  deleteJobAction,
  updateJobAction,
} from '@/utils/actions';
import type { CreateAndEditJobType, JobType } from '@/utils/types';
import { queryKeys } from '@/lib/query-keys';
import { invalidateAllJobQueries } from '@/lib/invalidate-jobs';
import { useToast } from '@/components/ui/use-toast';
import type { JobsListResult, StatsResult } from '@/lib/jobs/queries';

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

/** Create job — optimistic prepend to all job lists + stats bump */
export function useCreateJobMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: (values: CreateAndEditJobType) => createJobAction(values),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.stats.all });

      const previousJobs = queryClient.getQueriesData<JobsListCache>({
        queryKey: queryKeys.jobs.all,
      });
      const previousStats = queryClient.getQueryData<StatsCache>(
        queryKeys.stats.all
      );

      const optimisticJob: JobType = {
        id: `optimistic-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
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

      return { previousJobs, previousStats };
    },
    onError: (_err, _values, context) => {
      context?.previousJobs.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
      }
      toast({ description: 'There was an error creating the job.' });
    },
    onSuccess: (data) => {
      if (!data) return;
      toast({ description: 'Job created successfully.' });
      invalidateAfterMutation(data.id);
      router.push('/jobs');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.charts.all });
    },
  });
}

/** Update job — optimistic patch in detail + list caches */
export function useUpdateJobMutation(jobId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: (values: CreateAndEditJobType) =>
      updateJobAction(jobId, values),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });
      await queryClient.cancelQueries({
        queryKey: queryKeys.job.detail(jobId),
      });

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
    onError: (_err, _values, context) => {
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
      toast({ description: 'There was an error updating the job.' });
    },
    onSuccess: (result) => {
      if (!result) return;
      toast({ description: 'Job updated successfully.' });
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

/** Delete job — optimistic remove from lists + stats decrement */
export function useDeleteJobMutation(jobId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { invalidateAfterMutation } = useJobsInvalidation();

  return useMutation({
    mutationFn: () => deleteJobAction(jobId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.all });

      const previousJobs = queryClient.getQueriesData<JobsListCache>({
        queryKey: queryKeys.jobs.all,
      });
      const previousStats = queryClient.getQueryData<StatsCache>(
        queryKeys.stats.all
      );

      let removedStatus: string | undefined;
      queryClient.setQueriesData<JobsListCache>(
        { queryKey: queryKeys.jobs.all },
        (old) => {
          if (!old) return old;
          const removed = old.jobs.find((j) => j.id === jobId);
          removedStatus = removed?.status;
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

      return { previousJobs, previousStats };
    },
    onError: (_err, _vars, context) => {
      context?.previousJobs.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.stats.all, context.previousStats);
      }
      toast({ description: 'There was an error deleting the job.' });
    },
    onSuccess: (data) => {
      if (!data) return;
      invalidateAfterMutation(jobId);
      toast({ description: 'Job removed successfully.' });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.charts.all });
    },
  });
}

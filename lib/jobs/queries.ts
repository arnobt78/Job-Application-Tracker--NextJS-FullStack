/**
 * Tagged server reads — unstable_cache + cache tags pair with updateTag on CRUD.
 * Compatible with force-dynamic pages. Optional Redis read-through when Upstash is configured.
 */

import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import prisma from '@/utils/db';
import type { JobType } from '@/utils/types';
import { chartsTag, jobsTag, statsTag } from '@/lib/cache-tags';
import { getCache, setCache } from '@/lib/redis';
import type { JobFilterOptions } from '@/lib/jobs/filter-types';
import {
  formatMonthYearLabelUtc,
  monthRangeFromYearMonthUtc,
  monthYearKeyUtc,
} from '@/lib/jobs/month-utc';
import dayjs from 'dayjs';

export type JobsListResult = {
  jobs: JobType[];
  count: number;
  page: number;
  totalPages: number;
};

export type StatsResult = {
  pending: number;
  interview: number;
  declined: number;
  fullTime: number;
  partTime: number;
  internship: number;
  total: number;
};

export type ChartPoint = { date: string; count: number };

/** Paginated jobs list — tagged per user for instant bust on CRUD */
export async function getCachedJobs(
  userId: string,
  search: string,
  jobStatus: string,
  jobMode: string,
  monthYear: string,
  page: number,
  limit: number
): Promise<JobsListResult> {
  return unstable_cache(
    async () => {
      const redisKey = `jobs:${userId}:${search}:${jobStatus}:${jobMode}:${monthYear}:${page}:${limit}`;
      const cached = await getCache<JobsListResult>(redisKey);
      if (cached) return cached;

      let whereClause: Prisma.JobWhereInput = { clerkId: userId };

      if (search) {
        whereClause = {
          ...whereClause,
          OR: [
            { position: { contains: search } },
            { company: { contains: search } },
          ],
        };
      }

      if (jobStatus && jobStatus !== 'all') {
        whereClause = { ...whereClause, status: jobStatus };
      }

      if (jobMode && jobMode !== 'all') {
        whereClause = { ...whereClause, mode: jobMode };
      }

      const monthRange = monthRangeFromYearMonthUtc(monthYear);
      if (monthRange) {
        whereClause = {
          ...whereClause,
          createdAt: { gte: monthRange.gte, lte: monthRange.lte },
        };
      }

      const skip = (page - 1) * limit;

      const jobs = await prisma.job.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const count = await prisma.job.count({ where: whereClause });
      const totalPages = Math.ceil(count / limit);
      const result: JobsListResult = { jobs, count, page, totalPages };

      await setCache(redisKey, result);
      return result;
    },
    [
      'jobs-list',
      userId,
      search,
      jobStatus,
      jobMode,
      monthYear,
      String(page),
      String(limit),
    ],
    { tags: [jobsTag(userId)] }
  )();
}

/** Distinct months with applications — for month filter dropdown */
export async function getCachedJobFilterOptions(
  userId: string
): Promise<JobFilterOptions> {
  return unstable_cache(
    async () => {
      const redisKey = `job-filter-options:${userId}`;
      const cached = await getCache<JobFilterOptions>(redisKey);
      if (cached) return cached;

      const jobs = await prisma.job.findMany({
        where: { clerkId: userId },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
      });

      const monthKeys = new Set<string>();
      for (const job of jobs) {
        monthKeys.add(monthYearKeyUtc(job.createdAt));
      }

      const months = Array.from(monthKeys)
        .sort((a, b) => b.localeCompare(a))
        .map((value) => ({
          value,
          label: formatMonthYearLabelUtc(value),
        }));

      const result: JobFilterOptions = { months };
      await setCache(redisKey, result);
      return result;
    },
    ['job-filter-options', userId],
    { tags: [jobsTag(userId)] }
  )();
}

/** Single job — shares jobs tag so updateTag busts detail + list caches */
export async function getCachedJob(
  userId: string,
  id: string
): Promise<JobType | null> {
  return unstable_cache(
    async () => {
      const redisKey = `job:${userId}:${id}`;
      const cached = await getCache<JobType>(redisKey);
      if (cached) return cached;

      const job = await prisma.job.findUnique({
        where: { id, clerkId: userId },
      });

      if (job) {
        await setCache(redisKey, job);
      }
      return job;
    },
    ['job-detail', userId, id],
    { tags: [jobsTag(userId)] }
  )();
}

/** Stats cards + portfolio breakdown — separate tag for targeted invalidation */
export async function getCachedStats(userId: string): Promise<StatsResult> {
  return unstable_cache(
    async () => {
      const redisKey = `stats:${userId}`;
      const cached = await getCache<StatsResult>(redisKey);
      if (cached) return cached;

      const [statusGroups, modeGroups, total] = await Promise.all([
        prisma.job.groupBy({
          by: ['status'],
          _count: { status: true },
          where: { clerkId: userId },
        }),
        prisma.job.groupBy({
          by: ['mode'],
          _count: { mode: true },
          where: { clerkId: userId },
        }),
        prisma.job.count({ where: { clerkId: userId } }),
      ]);

      const statsObject = statusGroups.reduce(
        (acc, curr) => {
          const normalized = curr.status.toLowerCase();
          if (['pending', 'interview', 'declined'].includes(normalized)) {
            acc[normalized] = (acc[normalized] || 0) + curr._count.status;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      const modeObject = modeGroups.reduce(
        (acc, curr) => {
          const normalized = curr.mode.toLowerCase();
          if (normalized === 'full-time') {
            acc.fullTime = (acc.fullTime || 0) + curr._count.mode;
          } else if (normalized === 'part-time') {
            acc.partTime = (acc.partTime || 0) + curr._count.mode;
          } else if (normalized === 'internship') {
            acc.internship = (acc.internship || 0) + curr._count.mode;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      const result: StatsResult = {
        pending: 0,
        declined: 0,
        interview: 0,
        fullTime: 0,
        partTime: 0,
        internship: 0,
        total,
        ...statsObject,
        ...modeObject,
      };

      await setCache(redisKey, result);
      return result;
    },
    ['stats', userId],
    { tags: [statsTag(userId)] }
  )();
}

/** Charts data — last 6 months of applications */
export async function getCachedCharts(userId: string): Promise<ChartPoint[]> {
  return unstable_cache(
    async () => {
      const redisKey = `charts:${userId}`;
      const cached = await getCache<ChartPoint[]>(redisKey);
      if (cached) return cached;

      const now = dayjs().toDate();
      const sixMonthsAgo = dayjs().subtract(6, 'month').toDate();

      const jobs = await prisma.job.findMany({
        where: {
          clerkId: userId,
          createdAt: { gte: sixMonthsAgo, lte: now },
        },
        orderBy: { createdAt: 'asc' },
      });

      const result = jobs.reduce(
        (acc, job) => {
          const date = dayjs(job.createdAt).format('MMM YY');
          const existingEntry = acc.find((entry) => entry.date === date);
          if (existingEntry) {
            existingEntry.count += 1;
          } else {
            acc.push({ date, count: 1 });
          }
          return acc;
        },
        [] as ChartPoint[]
      );

      await setCache(redisKey, result);
      return result;
    },
    ['charts', userId],
    { tags: [chartsTag(userId)] }
  )();
}

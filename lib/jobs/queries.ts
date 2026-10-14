/**
 * Tagged server reads — unstable_cache + cache tags pair with updateTag on CRUD.
 * Compatible with force-dynamic pages. Optional Redis read-through when Upstash is configured.
 */

import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import prisma from '@/utils/db';
import type { JobType, SalaryIntelResult } from '@/utils/types';
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

export type WeeklyChartPoint = { week: string; count: number };

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

      let whereClause: Prisma.JobWhereInput = { userId };

      if (search) {
        whereClause = {
          ...whereClause,
          OR: [
            // mode: 'insensitive' — PostgreSQL contains is case-sensitive by default
            { position: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
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
        // Include AI fit score — 2 fields only, negligible overhead; auto-busted when saveAIInsightAction runs
        include: { aiInsight: { select: { fitScore: true, fitLabel: true } } },
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
        where: { userId },
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
        where: { id, userId },
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
          where: { userId },
        }),
        prisma.job.groupBy({
          by: ['mode'],
          _count: { mode: true },
          where: { userId },
        }),
        prisma.job.count({ where: { userId: userId } }),
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
          userId: userId,
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

/** Weekly application velocity — last 12 weeks, tagged per user alongside monthly charts */
export async function getCachedWeeklyCharts(
  userId: string
): Promise<WeeklyChartPoint[]> {
  return unstable_cache(
    async () => {
      const redisKey = `charts-weekly:${userId}`;
      const cached = await getCache<WeeklyChartPoint[]>(redisKey);
      if (cached) return cached;

      const now = dayjs();
      // Align to the current week's Monday, then go back 12 weeks
      const weekStart = now.startOf('week').add(1, 'day'); // Monday
      const twelveWeeksAgo = weekStart.subtract(12, 'week').toDate();

      const jobs = await prisma.job.findMany({
        where: {
          userId: userId,
          createdAt: { gte: twelveWeeksAgo, lte: now.toDate() },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      // Build a map: week Monday key → count
      const weekMap = new Map<string, number>();
      for (const job of jobs) {
        const d = dayjs(job.createdAt);
        // Get ISO week Monday
        const monday = d.subtract((d.day() + 6) % 7, 'day').startOf('day');
        const key = monday.format('MMM D');
        weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
      }

      // Fill in all 12 weeks in order (include zeros)
      const result: WeeklyChartPoint[] = [];
      for (let i = 11; i >= 0; i--) {
        const monday = weekStart.subtract(i, 'week');
        const key = monday.format('MMM D');
        result.push({ week: key, count: weekMap.get(key) ?? 0 });
      }

      await setCache(redisKey, result);
      return result;
    },
    ['charts-weekly', userId],
    { tags: [chartsTag(userId)] }
  )();
}

/** Salary intelligence — aggregated from Bluedoor-enriched jobs; null when no job has salary data yet */
export async function getCachedSalaryIntel(
  userId: string
): Promise<SalaryIntelResult | null> {
  return unstable_cache(
    async () => {
      const redisKey = `salary-intel:${userId}`;
      const cached = await getCache<SalaryIntelResult>(redisKey);
      if (cached) return cached;

      const [total, jobsWithSalary] = await Promise.all([
        prisma.job.count({ where: { userId } }),
        prisma.job.findMany({
          where: {
            userId,
            OR: [
              { bluedoorSalaryMin: { not: null } },
              { bluedoorSalaryMax: { not: null } },
            ],
          },
          select: {
            position: true,
            bluedoorSalaryMin: true,
            bluedoorSalaryMax: true,
            bluedoorSalaryCurrency: true,
          },
        }),
      ]);

      if (!jobsWithSalary.length) return null;

      // Overall averages
      let sumMin = 0, sumMax = 0, minCount = 0, maxCount = 0;
      const currencyMap: Record<string, number> = {};

      for (const j of jobsWithSalary) {
        if (j.bluedoorSalaryMin != null) { sumMin += j.bluedoorSalaryMin; minCount++; }
        if (j.bluedoorSalaryMax != null) { sumMax += j.bluedoorSalaryMax; maxCount++; }
        const cur = j.bluedoorSalaryCurrency ?? 'USD';
        currencyMap[cur] = (currencyMap[cur] ?? 0) + 1;
      }

      const avgMin = minCount > 0 ? Math.round(sumMin / minCount) : 0;
      const avgMax = maxCount > 0 ? Math.round(sumMax / maxCount) : 0;
      const currency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'USD';

      // Group by normalised position title (first 3 words — avoids 1-per-job explosion)
      const roleMap: Record<string, { sumMin: number; sumMax: number; minC: number; maxC: number }> = {};

      for (const j of jobsWithSalary) {
        const role = j.position.split(/\s+/).slice(0, 3).join(' ');
        if (!roleMap[role]) roleMap[role] = { sumMin: 0, sumMax: 0, minC: 0, maxC: 0 };
        if (j.bluedoorSalaryMin != null) { roleMap[role].sumMin += j.bluedoorSalaryMin; roleMap[role].minC++; }
        if (j.bluedoorSalaryMax != null) { roleMap[role].sumMax += j.bluedoorSalaryMax; roleMap[role].maxC++; }
      }

      const byRole = Object.entries(roleMap)
        .map(([position, d]) => ({
          position,
          avgMin: d.minC > 0 ? Math.round(d.sumMin / d.minC) : 0,
          avgMax: d.maxC > 0 ? Math.round(d.sumMax / d.maxC) : 0,
          count: Math.max(d.minC, d.maxC),
        }))
        .sort((a, b) => b.avgMax - a.avgMax)
        .slice(0, 5);

      const result: SalaryIntelResult = {
        count: jobsWithSalary.length,
        total,
        avgMin,
        avgMax,
        currency,
        byRole,
      };

      await setCache(redisKey, result);
      return result;
    },
    ['salary-intel', userId],
    { tags: [statsTag(userId)] }
  )();
}

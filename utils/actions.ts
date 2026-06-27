"use server";

import { after } from "next/server";
import prisma from "./db";
import { auth } from "@clerk/nextjs/server";
import { JobType, CreateAndEditJobType, createAndEditJobSchema } from "./types";
import { redirect } from "next/navigation";
import { invalidateUserJobCaches } from "@/lib/invalidate-jobs-server";
import {
  getCachedJobs,
  getCachedJob,
  getCachedStats,
  getCachedCharts,
  getCachedWeeklyCharts,
  getCachedJobFilterOptions,
  type StatsResult,
} from "@/lib/jobs/queries";
import type { JobFilterOptions } from "@/lib/jobs/filter-types";
import { enrichJob, resyncJob } from "@/lib/bluedoor/enrich";
import type { BluedoorJob, BluedoorJobEvent, BluedoorSearchResponse } from "@/lib/bluedoor/types";
import { getJobDetail, getJobEvents, searchJobs } from "@/lib/bluedoor/client";
import type { DiscoverSearchParams } from "@/lib/bluedoor/types";

async function authenticateAndRedirect(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  return userId;
}

// ─────────────────────────────────────────────
// Job CRUD
// ─────────────────────────────────────────────

export async function createJobAction(
  values: CreateAndEditJobType
): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  try {
    createAndEditJobSchema.parse(values);
    const job = await prisma.job.create({
      data: {
        ...values,
        // Zod transform returns undefined for empty string — coerce to null for DB
        applyUrl: values.applyUrl ?? null,
        clerkId: userId,
      },
    });

    await invalidateUserJobCaches(userId, job.id);

    // Fire Bluedoor enrichment after response is sent — non-blocking
    // `after` is stable in Next.js 15+ (v16 here). Runs post-response.
    if (job.applyUrl) {
      after(async () => {
        await enrichJob(job.id, userId);
      });
    }

    return job as JobType;
  } catch (error) {
    console.error(error);
    return null;
  }
}

type GetAllJobsActionTypes = {
  search?: string;
  jobStatus?: string;
  jobMode?: string;
  monthYear?: string;
  page?: number;
  limit?: number;
};

export async function getAllJobsAction({
  search,
  jobStatus,
  jobMode,
  monthYear,
  page = 1,
  limit = 10,
}: GetAllJobsActionTypes): Promise<{
  jobs: JobType[];
  count: number;
  page: number;
  totalPages: number;
}> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedJobs(
      userId,
      search ?? "",
      jobStatus ?? "all",
      jobMode ?? "all",
      monthYear ?? "all",
      page,
      limit
    );
  } catch (error) {
    console.error(error);
    return { jobs: [], count: 0, page: 1, totalPages: 0 };
  }
}

export async function getJobFilterOptionsAction(): Promise<JobFilterOptions> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedJobFilterOptions(userId);
  } catch (error) {
    console.error(error);
    return { months: [] };
  }
}

export async function deleteJobAction(id: string): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  try {
    const job = await prisma.job.delete({
      where: { id, clerkId: userId },
    });
    await invalidateUserJobCaches(userId, id);
    return job as JobType;
  } catch {
    return null;
  }
}

export async function getSingleJobAction(id: string): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  let job: JobType | null = null;
  try {
    job = await getCachedJob(userId, id);
  } catch {
    job = null;
  }

  if (!job) {
    redirect("/dashboard");
  }
  return job;
}

export async function updateJobAction(
  id: string,
  values: CreateAndEditJobType
): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  try {
    createAndEditJobSchema.parse(values);

    // Capture previous applyUrl to detect change
    const previous = await prisma.job.findUnique({
      where: { id, clerkId: userId },
      select: { applyUrl: true, bluedoorJobId: true },
    });

    const job = await prisma.job.update({
      where: { id, clerkId: userId },
      data: {
        ...values,
        applyUrl: values.applyUrl ?? null,
      },
    });

    await invalidateUserJobCaches(userId, id);

    const applyUrlChanged = previous?.applyUrl !== (values.applyUrl ?? null);
    const hasNewApplyUrl = !!values.applyUrl;

    // Re-enrich when applyUrl is added or changed
    if (hasNewApplyUrl && (applyUrlChanged || !previous?.bluedoorJobId)) {
      after(async () => {
        await enrichJob(id, userId);
      });
    }

    return job as JobType;
  } catch {
    return null;
  }
}

export async function getStatsAction(): Promise<StatsResult> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedStats(userId);
  } catch {
    redirect("/dashboard");
  }
}

export async function getChartsDataAction(): Promise<
  Array<{ date: string; count: number }>
> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedCharts(userId);
  } catch {
    redirect("/dashboard");
  }
}

/** Weekly application velocity — last 12 weeks. Used by WeeklyVelocityChart. */
export async function getWeeklyChartsDataAction(): Promise<
  Array<{ week: string; count: number }>
> {
  const userId = await authenticateAndRedirect();

  try {
    return await getCachedWeeklyCharts(userId);
  } catch {
    redirect("/dashboard");
  }
}

export async function getAllJobsForDownloadAction(): Promise<JobType[]> {
  const userId = await authenticateAndRedirect();

  try {
    const jobs = await prisma.job.findMany({
      where: { clerkId: userId },
      orderBy: { createdAt: "desc" },
    });
    return jobs as JobType[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ─────────────────────────────────────────────
// Bluedoor Enrichment
// ─────────────────────────────────────────────

/**
 * Manual enrichment trigger — user clicks "Refresh Posting" on a job card.
 * Re-runs full Bluedoor lookup and updates enrichment fields.
 */
export async function enrichJobAction(jobId: string): Promise<boolean> {
  const userId = await authenticateAndRedirect();

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId, clerkId: userId },
      select: { bluedoorJobId: true, applyUrl: true },
    });

    if (!job) return false;

    if (job.bluedoorJobId) {
      // Already linked — do a targeted resync
      return await resyncJob(jobId, userId, job.bluedoorJobId);
    }

    if (job.applyUrl) {
      // Not yet linked — run full enrichment flow
      await enrichJob(jobId, userId);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Discover — Bluedoor live job search
// ─────────────────────────────────────────────

/**
 * Fetch full Bluedoor job detail — called when user opens View Details modal.
 * Includes description_text (full JD) via ?include=description.
 */
export async function getBluedoorJobDetailsAction(
  jobId: string
): Promise<BluedoorJob | null> {
  await authenticateAndRedirect();

  try {
    return await getJobDetail(jobId);
  } catch (error) {
    console.error('[getBluedoorJobDetailsAction] error:', error);
    return null;
  }
}

/**
 * Fetch posting lifecycle events for a Bluedoor-linked job.
 * Called from PostingActivityTab when user opens the Activity panel.
 */
export async function getBluedoorJobEventsAction(
  bluedoorJobId: string
): Promise<BluedoorJobEvent[]> {
  await authenticateAndRedirect();

  try {
    const res = await getJobEvents(bluedoorJobId);
    return res.data;
  } catch (error) {
    console.error('[getBluedoorJobEventsAction] error:', error);
    return [];
  }
}

/**
 * Search Bluedoor for live job postings. Called from /discover page SSR
 * prefetch and client-side TanStack Query refetches (including infinite pages).
 *
 * cursor — opaque pagination token from meta.next_cursor of a prior response.
 *           Absent on the first page.
 */
export async function searchBluedoorJobsAction(
  params: Partial<DiscoverSearchParams> & { cursor?: string }
): Promise<BluedoorSearchResponse> {
  await authenticateAndRedirect();

  try {
    return await searchJobs({
      q: params.q || undefined,
      country: params.country || "United States",
      workplace_type:
        (params.workplaceType as "remote" | "hybrid" | "on_site") || undefined,
      employment_type:
        (params.employmentType as
          | "full_time"
          | "part_time"
          | "contract"
          | "temporary"
          | "internship"
          | undefined) || undefined,
      salary_exists: params.salaryExists || undefined,
      cursor: params.cursor || undefined,
      limit: 20,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[searchBluedoorJobsAction] Bluedoor request timed out');
    } else {
      console.error('[searchBluedoorJobsAction] error:', error);
    }
    return { data: [], meta: { limit: 20, order: '', total_matching_unavailable: true } };
  }
}

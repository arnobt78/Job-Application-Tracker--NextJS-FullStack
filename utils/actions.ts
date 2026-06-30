"use server";

import { after } from "next/server";
import * as z from "zod";
import prisma from "./db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { JobType, CreateAndEditJobType, createAndEditJobSchema, JobStatus, AIInsightType, UserProfileType, TimelineEvent, SalaryIntelResult, LLMSkillGapResult, TeamType, TeamMemberType, TeamRole, type JobActionResult } from "./types";
import { redirect } from "next/navigation";
import { invalidateUserJobCaches, revalidateUserJobsDataCache } from "@/lib/invalidate-jobs-server";
import { publishNotification } from "@/lib/jobs-events";
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
import type { BluedoorJob, BluedoorJobEvent, BluedoorSearchResponse, DiscoverFacets, DiscoverSearchParams } from "@/lib/bluedoor/types";
import {
  bluedoorEmploymentToJobMode,
  buildEnrichmentPatchFromDiscoverPayload,
  resolveDiscoverCompanyName,
  resolveTrackLocation,
  type DiscoverTrackPayload,
} from "@/lib/discover/track-helpers";
import { getDiscoverFacets, getJobDetail, getJobEvents, getBluedoorOrg, registerBluedoorWebhook, searchJobs, unregisterBluedoorWebhook } from "@/lib/bluedoor/client";
import { computeSkillGap } from "@/lib/jobs/skill-gap";
import type { SkillGapResult } from "@/lib/jobs/skill-gap";

/** Get authenticated user ID or redirect to /sign-in */
async function authenticateAndRedirect(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  return session.user.id;
}

/** Next.js navigation errors must propagate — never swallow as failed CRUD. */
function isNextNavigationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }
  const digest = String((error as { digest: unknown }).digest);
  return digest.includes("NEXT_REDIRECT") || digest.includes("NEXT_NOT_FOUND");
}

/** Map server errors to user-safe messages for job mutations. */
function jobActionErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid application data.";
  }
  if (error instanceof Error) {
    if (error.message.includes("Foreign key constraint")) {
      return "Your session is out of sync. Sign out and sign in again, then retry.";
    }
    return error.message;
  }
  return "Could not save application. Please try again.";
}

// ─────────────────────────────────────────────
// Job CRUD
// ─────────────────────────────────────────────

export async function createJobAction(
  values: CreateAndEditJobType
): Promise<JobActionResult> {
  try {
    const userId = await authenticateAndRedirect();

    const parsed = createAndEditJobSchema.parse({
      ...values,
      // Zod optional string rejects null — coerce before parse
      applyUrl: values.applyUrl ?? undefined,
    });

    const job = await prisma.job.create({
      data: {
        position: parsed.position,
        company: parsed.company,
        location: parsed.location,
        status: parsed.status,
        mode: parsed.mode,
        applyUrl: parsed.applyUrl ?? null,
        userId,
      },
    });

    await invalidateUserJobCaches(userId, job.id);

    // Fire Bluedoor enrichment after response is sent — non-blocking
    if (job.applyUrl) {
      after(async () => {
        await enrichJob(job.id, userId);
      });
    }

    return { success: true, job: job as JobType };
  } catch (error) {
    if (isNextNavigationError(error)) throw error;

    console.error("[createJobAction]", error);
    return {
      success: false,
      error: jobActionErrorMessage(error),
      code: "CREATE_FAILED",
    };
  }
}

/**
 * Track a Bluedoor posting as a dashboard application.
 * Pre-seeds bluedoorJobId + enrichment fields so badges appear without waiting on enrich.
 * Idempotent — returns the existing row when the same bluedoorJobId is already tracked.
 */
export async function trackJobFromDiscoverAction(
  payload: DiscoverTrackPayload
): Promise<JobActionResult> {
  try {
    const userId = await authenticateAndRedirect();

    const existing = await prisma.job.findFirst({
      where: { userId, bluedoorJobId: payload.jobId },
    });
    if (existing) {
      // Already tracked — return existing row without creating a duplicate
      return { success: true, job: existing as JobType, alreadyTracked: true };
    }

    const parsed = createAndEditJobSchema.parse({
      position: payload.title.trim(),
      company: resolveDiscoverCompanyName(payload.orgId, payload.applyUrl),
      location: resolveTrackLocation(payload.locationText, payload.country),
      status: JobStatus.Pending,
      mode: bluedoorEmploymentToJobMode(payload.employmentType),
      applyUrl: payload.applyUrl?.trim() || undefined,
    });

    const enrichment = buildEnrichmentPatchFromDiscoverPayload(payload);

    const job = await prisma.job.create({
      data: {
        position: parsed.position,
        company: parsed.company,
        location: parsed.location,
        status: parsed.status,
        mode: parsed.mode,
        applyUrl: parsed.applyUrl ?? null,
        userId,
        ...enrichment,
      },
    });

    await invalidateUserJobCaches(userId, job.id);

    // Org metadata + webhook subscription — best-effort, post-response
    after(async () => {
      try {
        const org = await getBluedoorOrg(payload.orgId);
        if (org) {
          await prisma.job.update({
            where: { id: job.id, userId },
            data: {
              companySize: org.size ?? null,
              companyIndustry: org.industry ?? null,
              companyHq: org.hq_location ?? null,
            },
          });
          // Lightweight invalidation only — Redis was already fully purged pre-response.
          // A second SCAN here would race with freshly-repopulated cache keys.
          await revalidateUserJobsDataCache(userId, job.id);
        }

        const subId = await registerBluedoorWebhook(payload.jobId);
        if (subId) {
          await prisma.job.update({
            where: { id: job.id, userId },
            data: { bluedoorWebhookSubId: subId },
          });
        }
      } catch (err) {
        console.error("[trackJobFromDiscoverAction:after]", err);
      }
    });

    return { success: true, job: job as JobType };
  } catch (error) {
    if (isNextNavigationError(error)) throw error;

    console.error("[trackJobFromDiscoverAction]", error);
    return {
      success: false,
      error: jobActionErrorMessage(error),
      code: "TRACK_FAILED",
    };
  }
}

// ─────────────────────────────────────────────
// Auth — Registration
// ─────────────────────────────────────────────

/**
 * Create a new user account with hashed password.
 * Called from useSignUpForm before signIn('credentials', ...).
 */
export async function createUserAction(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed },
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique constraint') || msg.includes('unique')) {
      return { success: false, error: 'Email already in use.' };
    }
    console.error('[createUserAction] error:', err);
    return { success: false, error: 'Could not create account. Please try again.' };
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
    // Fetch webhook sub ID before delete so we can unsubscribe from Bluedoor (best-effort)
    const meta = await prisma.job.findUnique({
      where: { id, userId },
      select: { bluedoorWebhookSubId: true },
    });

    const job = await prisma.job.delete({
      where: { id, userId },
    });

    await invalidateUserJobCaches(userId, id);

    // Unsubscribe Bluedoor webhook after job is deleted — non-blocking, never throws
    if (meta?.bluedoorWebhookSubId) {
      void unregisterBluedoorWebhook(meta.bluedoorWebhookSubId);
    }

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

    // Capture previous state to detect changes
    const previous = await prisma.job.findUnique({
      where: { id, userId },
      select: { applyUrl: true, bluedoorJobId: true, status: true },
    });

    const job = await prisma.job.update({
      where: { id, userId },
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

    // Trigger interview-prep when job moves INTO interview status
    const movingToInterview =
      values.status === 'interview' && previous?.status !== 'interview';
    if (movingToInterview) {
      after(async () => {
        await triggerInterviewPrepAction(id, userId);
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
      where: { userId },
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
      where: { id: jobId, userId },
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

// ─────────────────────────────────────────────
// Phase 2 — AI Insights
// ─────────────────────────────────────────────

/** Load persisted AI insight for a job — null if not yet generated. */
export async function getAIInsightAction(jobId: string): Promise<AIInsightType | null> {
  const userId = await authenticateAndRedirect();

  try {
    const insight = await prisma.jobAIInsight.findUnique({
      where: { jobId },
    });
    if (!insight || insight.userId !== userId) return null;
    return insight as AIInsightType;
  } catch {
    return null;
  }
}

/** Persist AI insight after pipeline run — upsert so regenerate replaces previous result. */
export async function saveAIInsightAction(
  jobId: string,
  data: Partial<Omit<AIInsightType, 'id' | 'jobId' | 'userId' | 'generatedAt' | 'updatedAt'>>
): Promise<AIInsightType | null> {
  const userId = await authenticateAndRedirect();

  try {
    const insight = await prisma.jobAIInsight.upsert({
      where: { jobId },
      create: {
        jobId,
        userId,
        fitScore: data.fitScore ?? null,
        fitLabel: data.fitLabel ?? null,
        summary: data.summary ?? null,
        coverLetter: data.coverLetter ?? null,
        interviewAngles: data.interviewAngles ?? [],
        redFlags: data.redFlags ?? [],
      },
      update: {
        fitScore: data.fitScore ?? null,
        fitLabel: data.fitLabel ?? null,
        summary: data.summary ?? null,
        coverLetter: data.coverLetter ?? null,
        interviewAngles: data.interviewAngles ?? [],
        redFlags: data.redFlags ?? [],
        generatedAt: new Date(),
      },
    });
    await invalidateUserJobCaches(userId, jobId);
    return insight as AIInsightType;
  } catch {
    return null;
  }
}

/** Load user profile for AI personalisation — null if not yet created. */
export async function getUserProfileAction(): Promise<UserProfileType | null> {
  const userId = await authenticateAndRedirect();

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    return profile as UserProfileType | null;
  } catch {
    return null;
  }
}

/** Create or update user profile skills + target roles for AI personalisation. */
export async function upsertUserProfileAction(
  data: Partial<Omit<UserProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfileType | null> {
  const userId = await authenticateAndRedirect();

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        skills: data.skills ?? [],
        targetRoles: data.targetRoles ?? [],
        experienceLevel: data.experienceLevel ?? null,
        resumeText: data.resumeText ?? null,
      },
      update: {
        skills: data.skills ?? [],
        targetRoles: data.targetRoles ?? [],
        experienceLevel: data.experienceLevel ?? null,
        resumeText: data.resumeText ?? null,
      },
    });
    return profile as UserProfileType;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill Gap — compare user profile skills vs job description
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute skill gap for a job.
 * Pulls user's skills from UserProfile + job description from Bluedoor (if linked).
 * Falls back to position+company text when no Bluedoor description is available.
 *
 * Returns SkillGapResult or null when user has no skills set.
 */
export async function getSkillGapAction(jobId: string): Promise<SkillGapResult | null> {
  const userId = await authenticateAndRedirect();

  try {
    const [profile, jobRow] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId }, select: { skills: true } }),
      prisma.job.findUnique({
        where: { id: jobId, userId },
        select: { position: true, company: true, bluedoorJobId: true },
      }),
    ]);

    const userSkills: string[] = profile?.skills ?? [];

    let jobDescription = [jobRow?.position, jobRow?.company].filter(Boolean).join(' ');

    if (jobRow?.bluedoorJobId) {
      try {
        const detail = await getJobDetail(jobRow.bluedoorJobId);
        if (detail?.description_text) {
          jobDescription = detail.description_text;
        }
      } catch {
        // Bluedoor unreachable — fall back to position+company text
      }
    }

    if (!userSkills.length) return null;

    return computeSkillGap(userSkills, jobDescription);
  } catch {
    return null;
  }
}

/** Fetch workplace_type + employment_type facet counts for /discover filter dropdowns. */
export async function getBluedoorFacetsAction(
  params: { q?: string; country?: string }
): Promise<DiscoverFacets> {
  await authenticateAndRedirect();

  try {
    return await getDiscoverFacets(params);
  } catch {
    return { workplace_type: [], employment_type: [] };
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

/** Chronological activity feed for /timeline — built from Job rows, cached by jobsTag. */
export async function getTimelineAction(): Promise<TimelineEvent[]> {
  const userId = await authenticateAndRedirect();

  try {
    const { getTimelineEvents } = await import('@/lib/jobs/timeline');
    return await getTimelineEvents(userId);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Salary Intelligence — aggregate from enriched jobs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate salary data from the user's Bluedoor-enriched jobs.
 * Returns null when no jobs have salary data yet.
 */
export async function getSalaryIntelligenceAction(): Promise<SalaryIntelResult | null> {
  const userId = await authenticateAndRedirect();

  try {
    // All jobs for total count
    const total = await prisma.job.count({ where: { userId } });

    // Jobs with at least one salary field
    const jobsWithSalary = await prisma.job.findMany({
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
    });

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

    // Group by normalised position title (first 2 words — avoids 1-per-job explosion)
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

    return {
      count: jobsWithSalary.length,
      total,
      avgMin,
      avgMax,
      currency,
      byRole,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume PDF upload — extract text + persist to UserProfile.resumeText
// ─────────────────────────────────────────────────────────────────────────────

export type UploadResumeResult =
  | { success: true; text: string }
  | { success: false; error: string };

/**
 * Server action: accept a PDF File from FormData, extract text via pdfjs-dist,
 * and upsert into UserProfile.resumeText. Validates size (5MB max) and MIME type.
 */
export async function uploadResumeAction(formData: FormData): Promise<UploadResumeResult> {
  const userId = await authenticateAndRedirect();

  const file = formData.get('resume');
  if (!file || !(file instanceof File)) {
    return { success: false, error: 'No file provided.' };
  }

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_BYTES) {
    return { success: false, error: 'File exceeds 5 MB limit. Try a smaller PDF.' };
  }

  if (file.type !== 'application/pdf') {
    return { success: false, error: 'Only PDF files are accepted.' };
  }

  try {
    const { extractPdfText } = await import('@/lib/pdf/extract-text');
    const buffer = await file.arrayBuffer();
    const text = await extractPdfText(buffer);

    if (!text.trim()) {
      return { success: false, error: 'Could not extract text from this PDF. Try pasting the resume text directly.' };
    }

    await prisma.userProfile.upsert({
      where: { userId },
      update: { resumeText: text.trim() },
      create: {
        userId,
        skills: [],
        targetRoles: [],
        experienceLevel: null,
        resumeText: text.trim(),
      },
    });

    return { success: true, text: text.trim() };
  } catch {
    return { success: false, error: 'Failed to parse PDF. Please try again or paste the text directly.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// P2 — Interview-Prep Auto-Trigger
// ─────────────────────────────────────────────────────────────────────────────

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:3000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';

/**
 * Background action: call FastAPI /pipeline/interview-prep when a job moves to 'interview'.
 * Non-blocking — called via after() in updateJobAction.
 * Merges returned interview_angles into the existing JobAIInsight (or creates one).
 */
async function triggerInterviewPrepAction(jobId: string, userId: string): Promise<void> {
  try {
    const [job, profile] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId, userId },
        select: {
          position: true, company: true, location: true, status: true, mode: true,
          applyUrl: true, bluedoorStatus: true, bluedoorWorkplaceType: true,
          bluedoorSalaryMin: true, bluedoorSalaryMax: true, bluedoorSalaryCurrency: true,
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: { resumeText: true, targetRoles: true, skills: true },
      }),
    ]);

    if (!job) return;

    const payload = {
      job: {
        job_id: jobId,
        position: job.position,
        company: job.company,
        location: job.location,
        status: job.status,
        mode: job.mode,
        apply_url: job.applyUrl ?? null,
        bluedoor_status: job.bluedoorStatus ?? null,
        bluedoor_workplace_type: job.bluedoorWorkplaceType ?? null,
        bluedoor_salary_min: job.bluedoorSalaryMin ?? null,
        bluedoor_salary_max: job.bluedoorSalaryMax ?? null,
        bluedoor_salary_currency: job.bluedoorSalaryCurrency ?? null,
      },
      user: {
        resume_summary: profile?.resumeText ?? null,
        target_role: profile?.targetRoles?.[0] ?? null,
        skills: profile?.skills ?? [],
      },
    };

    const res = await fetch(`${AI_SERVICE_URL}/pipeline/interview-prep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': AI_SERVICE_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) return;

    const result = (await res.json()) as {
      interview_angles: Array<{ question: string; angle: string }>;
    };

    const angles = result.interview_angles.map((a) => `${a.question}: ${a.angle}`);
    if (!angles.length) return;

    // Merge angles into existing insight — upsert preserves fit score / cover letter in create path
    await prisma.jobAIInsight.upsert({
      where: { jobId },
      create: { jobId, userId, interviewAngles: angles, redFlags: [] },
      update: {
        interviewAngles: angles,
        updatedAt: new Date(),
      },
    });

    await invalidateUserJobCaches(userId, jobId);
    await publishNotification(userId, 'interview_prep_ready', jobId,
      'Interview prep ready — check AI Insights for angles!');
  } catch {
    // Non-critical background task — silent failure
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// P3 — LLM-Powered Skill Gap
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LLM-powered skill gap — calls FastAPI /skill-gap for semantic matching.
 * Falls back to keyword-based computeSkillGap when AI service is unavailable.
 * Returns LLMSkillGapResult (superset of SkillGapResult) or null if no skills.
 */
export async function getLLMSkillGapAction(jobId: string): Promise<LLMSkillGapResult | null> {
  const userId = await authenticateAndRedirect();

  try {
    const [profile, jobRow] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId }, select: { skills: true } }),
      prisma.job.findUnique({
        where: { id: jobId, userId },
        select: { position: true, company: true, bluedoorJobId: true },
      }),
    ]);

    const userSkills: string[] = profile?.skills ?? [];
    if (!userSkills.length) return null;

    let jobDescription = [jobRow?.position, jobRow?.company].filter(Boolean).join(' ');

    if (jobRow?.bluedoorJobId) {
      try {
        const detail = await getJobDetail(jobRow.bluedoorJobId);
        if (detail?.description_text) {
          jobDescription = detail.description_text;
        }
      } catch {
        // Bluedoor unreachable — fall back to position+company text
      }
    }

    // Call FastAPI /skill-gap (LLM-powered)
    try {
      const res = await fetch(`${AI_SERVICE_URL}/skill-gap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': AI_SERVICE_SECRET,
        },
        body: JSON.stringify({
          job_description: jobDescription,
          user_skills: userSkills,
          position: jobRow?.position ?? '',
          company: jobRow?.company ?? '',
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          matched: string[];
          missing: string[];
          bonus: string[];
          match_pct: number;
          ai_explanation: string | null;
          learning_path: string[];
          confidence: string;
        };
        return {
          matched: data.matched,
          missing: data.missing,
          bonus: data.bonus,
          matchPct: data.match_pct,
          aiExplanation: data.ai_explanation,
          learningPath: data.learning_path,
          confidence: (data.confidence as 'high' | 'medium' | 'low') ?? 'medium',
        };
      }
    } catch {
      // AI service unavailable — fall back to keyword analysis below
    }

    // Keyword fallback — same as getSkillGapAction
    const keywordResult = computeSkillGap(userSkills, jobDescription);
    return {
      ...keywordResult,
      aiExplanation: null,
      learningPath: [],
      confidence: 'low' as const,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// P5 — Team Mode Actions
// ─────────────────────────────────────────────────────────────────────────────

/** Assert user is a member of the team with at least minRole privilege.
 *  Throws if not a member or insufficient role. */
async function assertTeamMembership(
  userId: string,
  teamId: string,
  minRole: TeamRole = 'member'
): Promise<void> {
  const roleOrder: Record<TeamRole, number> = { member: 0, admin: 1, owner: 2 };
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { role: true },
  });
  if (!membership) throw new Error('Not a team member');
  const userRoleLevel = roleOrder[membership.role as TeamRole] ?? -1;
  const requiredLevel = roleOrder[minRole];
  if (userRoleLevel < requiredLevel) throw new Error('Insufficient team role');
}

/** Create a new team and auto-add the creator as owner. */
export async function createTeamAction(name: string): Promise<TeamType | null> {
  const userId = await authenticateAndRedirect();

  try {
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        ownerId: userId,
        members: {
          create: { userId, role: 'owner' },
        },
      },
    });
    return team as TeamType;
  } catch {
    return null;
  }
}

/** Get the current user's team (they may own or be a member of). */
export async function getTeamAction(): Promise<{
  team: TeamType;
  members: TeamMemberType[];
  role: TeamRole;
} | null> {
  const userId = await authenticateAndRedirect();

  try {
    const membership = await prisma.teamMember.findFirst({
      where: { userId },
      include: {
        team: true,
        user: { select: { name: true, email: true, image: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });

    if (!membership) return null;

    const members = await prisma.teamMember.findMany({
      where: { teamId: membership.teamId },
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    return {
      team: membership.team as TeamType,
      members: members as unknown as TeamMemberType[],
      role: membership.role as TeamRole,
    };
  } catch {
    return null;
  }
}

/** Invite a user by email to the current user's team. Admin/owner only. */
export async function inviteTeamMemberAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await authenticateAndRedirect();

  try {
    const ownerMembership = await prisma.teamMember.findFirst({
      where: { userId, role: { in: ['owner', 'admin'] } },
    });
    if (!ownerMembership) return { success: false, error: 'Not an admin or owner.' };

    const invitee = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });
    if (!invitee) return { success: false, error: 'No user found with that email.' };

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: ownerMembership.teamId, userId: invitee.id } },
    });
    if (existing) return { success: false, error: 'User is already a team member.' };

    await prisma.teamMember.create({
      data: { teamId: ownerMembership.teamId, userId: invitee.id, role: 'member' },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Could not invite member. Please try again.' };
  }
}

/** Remove a team member. Owner/admin only; owner cannot be removed. */
export async function removeTeamMemberAction(memberId: string): Promise<boolean> {
  const userId = await authenticateAndRedirect();

  try {
    const target = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { teamId: true, userId: true, role: true },
    });
    if (!target) return false;
    if (target.role === 'owner') return false;

    await assertTeamMembership(userId, target.teamId, 'admin');
    await prisma.teamMember.delete({ where: { id: memberId } });
    return true;
  } catch {
    return false;
  }
}

/** Get all jobs belonging to a team (requires membership). */
export async function getTeamJobsAction(teamId: string): Promise<JobType[]> {
  const userId = await authenticateAndRedirect();

  try {
    await assertTeamMembership(userId, teamId);
    const jobs = await prisma.job.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });
    return jobs as JobType[];
  } catch {
    return [];
  }
}

/** Create a job scoped to a team. User must be a team member. */
export async function createTeamJobAction(
  teamId: string,
  values: CreateAndEditJobType
): Promise<JobType | null> {
  const userId = await authenticateAndRedirect();

  try {
    await assertTeamMembership(userId, teamId);
    createAndEditJobSchema.parse(values);

    const job = await prisma.job.create({
      data: {
        ...values,
        applyUrl: values.applyUrl ?? null,
        userId,
        teamId,
      },
    });

    await invalidateUserJobCaches(userId, job.id);

    if (job.applyUrl) {
      after(async () => { await enrichJob(job.id, userId); });
    }

    return job as JobType;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// P6 — Auto-Apply Email Detection
// ─────────────────────────────────────────────────────────────────────────────

const INBOUND_EMAIL_DOMAIN = process.env.INBOUND_EMAIL_DOMAIN ?? 'apply.jobify-tracker.app';

/**
 * Generate (or retrieve) the user's unique inbound email address.
 * Format: user-{shortId}@{INBOUND_EMAIL_DOMAIN}
 * Persisted to UserProfile.inboundEmailAddress.
 */
export async function generateInboundEmailAction(): Promise<string> {
  const userId = await authenticateAndRedirect();

  const existing = await prisma.userProfile.findUnique({
    where: { userId },
    select: { inboundEmailAddress: true },
  });

  if (existing?.inboundEmailAddress) {
    return existing.inboundEmailAddress;
  }

  // Generate deterministic short ID from userId (no crypto dependency)
  const shortId = userId.slice(-8).toLowerCase();
  const address = `user-${shortId}@${INBOUND_EMAIL_DOMAIN}`;

  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      skills: [],
      targetRoles: [],
      experienceLevel: null,
      inboundEmailAddress: address,
    },
    update: { inboundEmailAddress: address },
  });

  return address;
}


/**
 * Types and Validation Schema File
 *
 * Defines TypeScript types for job data, enums for status/mode values,
 * Zod validation schemas for form inputs, and Bluedoor enrichment enums.
 */
import * as z from 'zod';

/**
 * JobType — TypeScript type matching the full Prisma Job model including
 * Bluedoor enrichment fields. All enrichment fields are optional and null
 * until the background enrich task runs.
 */
export type JobType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  position: string;
  company: string;
  location: string;
  status: string; // pending | interview | declined
  mode: string;   // full-time | part-time | internship

  // URL the user applied through — key for Bluedoor join
  applyUrl?: string | null;

  // Bluedoor live-posting enrichment — absent or null until enrich runs
  bluedoorJobId?: string | null;
  bluedoorOrgId?: string | null;
  bluedoorProvider?: string | null; // greenhouse | lever | ashby | workday
  bluedoorStatus?: string | null;   // active | expired | unknown
  bluedoorWorkplaceType?: string | null; // remote | hybrid | on_site
  bluedoorSalaryMin?: number | null;
  bluedoorSalaryMax?: number | null;
  bluedoorSalaryCurrency?: string | null;
  bluedoorDescHash?: string | null;
  bluedoorSyncedAt?: Date | null;
  bluedoorChangedAt?: Date | null;
  bluedoorWebhookSubId?: string | null;

  // Company/org-level data from Bluedoor /v1/orgs — optional, populated after job match
  companySize?: string | null;
  companyIndustry?: string | null;
  companyHq?: string | null;
};

/** Persisted AI pipeline insight for a specific job. */
export type AIInsightType = {
  id: string;
  jobId: string;
  userId: string;
  fitScore: number | null;
  fitLabel: string | null;       // strong_fit | good_fit | partial_fit | poor_fit
  summary: string | null;
  coverLetter: string | null;
  interviewAngles: string[];
  redFlags: string[];
  generatedAt: Date;
  updatedAt: Date;
};

/** Optional user profile for AI personalisation. */
export type UserProfileType = {
  id: string;
  userId: string;
  skills: string[];
  targetRoles: string[];
  experienceLevel: string | null; // entry | mid | senior | staff | principal
  resumeText: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Timeline event types — derived from Job fields.
 * status_changed requires a history table (not yet present); omitted for now.
 */
export type TimelineEventType =
  | 'job_created'
  | 'enriched'
  | 'posting_changed'
  | 'ai_generated';

/**
 * A single activity event on the global timeline.
 * Built by lib/jobs/timeline.ts from Job rows + aiInsight.
 */
export type TimelineEvent = {
  /** Stable unique ID: `${jobId}:${type}` */
  id: string;
  type: TimelineEventType;
  jobId: string;
  position: string;
  company: string;
  /** Human-readable context (e.g. status, bluedoorStatus) */
  detail: string | null;
  timestamp: Date;
};

/** Application status values */
export enum JobStatus {
  Pending = 'pending',
  Interview = 'interview',
  Declined = 'declined',
}

/** Employment type values */
export enum JobMode {
  FullTime = 'full-time',
  PartTime = 'part-time',
  Internship = 'internship',
}

/**
 * Bluedoor posting status — reflects whether the live job posting is
 * still active or has been taken down since the user applied.
 */
export enum BluedoorStatus {
  Active = 'active',
  Expired = 'expired',
  Unknown = 'unknown',
}

/** Bluedoor workplace type values (normalised by Bluedoor) */
export enum BluedoorWorkplaceType {
  Remote = 'remote',
  Hybrid = 'hybrid',
  OnSite = 'on_site',
}

/**
 * Zod schema for job create/edit form.
 * applyUrl is optional — enrichment triggers automatically when provided.
 */
export const createAndEditJobSchema = z.object({
  position: z.string().min(2, {
    message: 'position must be at least 2 characters.',
  }),
  company: z.string().min(2, {
    message: 'company must be at least 2 characters.',
  }),
  location: z.string().min(2, {
    message: 'location must be at least 2 characters.',
  }),
  status: z.nativeEnum(JobStatus),
  mode: z.nativeEnum(JobMode),
  // Optional URL — empty string or valid URL both accepted
  applyUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v === '' || isValidUrl(v), {
      message: 'Must be a valid URL (e.g. https://jobs.lever.co/…)',
    })
    .transform((v) => (v === '' ? undefined : v)),
});

export type CreateAndEditJobType = z.infer<typeof createAndEditJobSchema>;

/** Loose URL check — allows http and https, any host */
function isValidUrl(val: string): boolean {
  try {
    const u = new URL(val);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

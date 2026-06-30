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

  // AI fit score — present when JobAIInsight exists for this job (included via getCachedJobs)
  aiInsight?: { fitScore: number | null; fitLabel: string | null } | null;

  // Team — null for personal jobs
  teamId?: string | null;
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
  // Browser extension auth token — generated on demand from /profile page
  extensionToken?: string | null;
  // Unique inbound email for auto-apply detection
  inboundEmailAddress?: string | null;
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

/** LLM-powered skill gap result — extends keyword analysis with AI explanation. */
export type LLMSkillGapResult = {
  matched: string[];
  missing: string[];
  bonus: string[];
  matchPct: number;
  /** LLM explanation of overall fit (null when AI unavailable — falls back to keyword) */
  aiExplanation: string | null;
  /** Ordered list of skills to learn, ranked by impact on this role */
  learningPath: string[];
  /** Confidence in the analysis — depends on how much job description detail was available */
  confidence: 'high' | 'medium' | 'low';
};

/** Team role — owner has full control; admin can invite/remove; member can view/add jobs. */
export type TeamRole = 'owner' | 'admin' | 'member';

/** A shared team for collaborative job tracking. */
export type TeamType = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

/** A team membership entry with user details. */
export type TeamMemberType = {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
};

/** Salary intelligence — aggregated from the user's enriched jobs. */
export type SalaryIntelResult = {
  /** Jobs with salary data */
  count: number;
  /** Total tracked jobs (for coverage ratio) */
  total: number;
  /** Average of bluedoorSalaryMin across jobs with salary data (annualised, in currency below) */
  avgMin: number;
  /** Average of bluedoorSalaryMax across jobs with salary data */
  avgMax: number;
  /** Most common salary currency among enriched jobs */
  currency: string;
  /** Top roles by salary, descending by avgMax, max 5 */
  byRole: Array<{
    position: string;
    avgMin: number;
    avgMax: number;
    count: number;
  }>;
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

/** Structured server-action result — avoids silent null failures on the client. */
export type JobActionResult =
  | {
      success: true;
      job: JobType;
      /** True when trackJobFromDiscoverAction found an existing row — no new DB row created. */
      alreadyTracked?: boolean;
    }
  | { success: false; error: string; code?: string };

/** Loose URL check — allows http and https, any host */
function isValidUrl(val: string): boolean {
  try {
    const u = new URL(val);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

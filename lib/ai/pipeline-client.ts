/**
 * Shared contract for the Python AI pipeline service (client + server safe).
 *
 * Types mirror the Python Pydantic models in python-ai-service/app/models/.
 * Network calls live in the API routes (/api/ai/pipeline/stream, /api/ai/batch)
 * and utils/actions.ts — this module stays free of secrets and fetch logic.
 */

// ─────────────────────────────────────────────
// Request / Response types (mirror Python Pydantic models)
// ─────────────────────────────────────────────

export type PipelineJobInput = {
  job_id: string;
  position: string;
  company: string;
  location: string;
  status: string;
  mode: string;
  apply_url?: string | null;
  bluedoor_status?: string | null;
  bluedoor_workplace_type?: string | null;
  bluedoor_salary_min?: number | null;
  bluedoor_salary_max?: number | null;
  bluedoor_salary_currency?: string | null;
};

export type PipelineUserProfile = {
  resume_summary?: string | null;
  target_role?: string | null;
  years_experience?: number | null;
  skills?: string[];
};

export type PipelineOutput = 'fit_score' | 'cover_letter' | 'interview_angles' | 'summary';

export const ALL_PIPELINE_OUTPUTS: PipelineOutput[] = [
  'fit_score',
  'cover_letter',
  'interview_angles',
  'summary',
];

export type PipelineRequest = {
  job: PipelineJobInput;
  user?: PipelineUserProfile;
  include?: PipelineOutput[];
};

export type FitScoreResult = { score: number; reasoning: string };
export type CoverLetterResult = { text: string; word_count: number };
export type InterviewAngle = { question: string; angle: string };

export type PipelineResponse = {
  job_id: string;
  fit_score: FitScoreResult | null;
  cover_letter: CoverLetterResult | null;
  interview_angles: InterviewAngle[];
  summary: string | null;
  meta: Record<string, unknown>;
};

/** Tracked-job fields the pipeline needs — satisfied by both JobType and a Prisma Job row. */
export type PipelineJobSource = {
  id: string;
  position: string;
  company: string;
  location: string;
  status: string;
  mode: string;
  applyUrl?: string | null;
  bluedoorStatus?: string | null;
  bluedoorWorkplaceType?: string | null;
  bluedoorSalaryMin?: number | null;
  bluedoorSalaryMax?: number | null;
  bluedoorSalaryCurrency?: string | null;
};

export function toPipelineJobInput(job: PipelineJobSource): PipelineJobInput {
  return {
    job_id: job.id,
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
  };
}

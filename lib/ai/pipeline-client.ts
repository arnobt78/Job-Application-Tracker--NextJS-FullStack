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
  posting_status?: string | null;
  workplace_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
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
  postingStatus?: string | null;
  workplaceType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
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
    posting_status: job.postingStatus ?? null,
    workplace_type: job.workplaceType ?? null,
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    salary_currency: job.salaryCurrency ?? null,
  };
}

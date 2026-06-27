/**
 * Typed client for the Python AI pipeline service.
 *
 * Adds X-Internal-Secret header (AI_SERVICE_SECRET).
 * Times out after 30 seconds (pipeline can be slow on cold Ollama start).
 * AI_SERVICE_URL defaults to http://localhost:8000 for local dev.
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

export type PipelineRequest = {
  job: PipelineJobInput;
  user?: PipelineUserProfile;
  include?: Array<'fit_score' | 'cover_letter' | 'interview_angles' | 'summary'>;
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

// ─────────────────────────────────────────────
// Client function — called from Next.js API route proxy
// ─────────────────────────────────────────────

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';
const TIMEOUT_MS = 30_000;

export class AiServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`AI service ${status}: ${body}`);
    this.name = 'AiServiceError';
  }
}

export async function runAiPipeline(
  payload: PipelineRequest
): Promise<PipelineResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${AI_SERVICE_URL}/pipeline/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_SERVICE_SECRET ? { 'X-Internal-Secret': AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new AiServiceError(res.status, text);
    }

    return res.json() as Promise<PipelineResponse>;
  } finally {
    clearTimeout(timer);
  }
}

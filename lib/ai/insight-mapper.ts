/**
 * Single mapping between the Python PipelineResponse and the JobAIInsight row.
 *
 * Used by the per-job panel (stream result → save) and the ARQ batch callback
 * (/api/internal/ai-complete), so both paths persist identical data.
 */

import type { AIInsightType } from '@/utils/types';
import type { InterviewAngle, PipelineResponse } from '@/lib/ai/pipeline-client';

export const FIT_LABELS = ['strong_fit', 'good_fit', 'partial_fit', 'poor_fit'] as const;
export type FitLabel = (typeof FIT_LABELS)[number];

export const FIT_LABEL_TEXT: Record<FitLabel, string> = {
  strong_fit: 'Strong fit',
  good_fit: 'Good fit',
  partial_fit: 'Partial fit',
  poor_fit: 'Poor fit',
};

/** Bucket a 0–100 fit score into the label stored in JobAIInsight.fitLabel. */
export function fitLabelFromScore(score: number | null | undefined): FitLabel | null {
  if (score == null || !Number.isFinite(score)) return null;
  if (score >= 75) return 'strong_fit';
  if (score >= 60) return 'good_fit';
  if (score >= 40) return 'partial_fit';
  return 'poor_fit';
}

function isFitLabel(value: string | null): value is FitLabel {
  return value != null && (FIT_LABELS as readonly string[]).includes(value);
}

export type InsightFields = Pick<
  AIInsightType,
  'fitScore' | 'fitLabel' | 'summary' | 'coverLetter' | 'interviewAngles' | 'redFlags'
>;

const ANGLE_SEPARATOR = ': ';

/** Stored form of one interview angle in JobAIInsight.interviewAngles. */
export function formatInterviewAngle(a: InterviewAngle): string {
  return a.angle ? `${a.question}${ANGLE_SEPARATOR}${a.angle}` : a.question;
}

/** PipelineResponse (Python snake_case) → JobAIInsight columns. */
export function pipelineResultToInsight(result: Partial<PipelineResponse>): InsightFields {
  const fitScore = result.fit_score?.score ?? null;
  return {
    fitScore,
    fitLabel: fitLabelFromScore(fitScore),
    summary: result.summary ?? null,
    coverLetter: result.cover_letter?.text ?? null,
    interviewAngles: (result.interview_angles ?? []).map(formatInterviewAngle),
    redFlags: [],
  };
}

/** Persisted JobAIInsight → PipelineResponse shape, so the panel renders one format. */
export function insightToPipelineResponse(insight: AIInsightType): PipelineResponse {
  const angles: InterviewAngle[] = insight.interviewAngles.map((raw) => {
    const sep = raw.indexOf(ANGLE_SEPARATOR);
    return sep !== -1
      ? { question: raw.slice(0, sep), angle: raw.slice(sep + ANGLE_SEPARATOR.length) }
      : { question: raw, angle: '' };
  });

  return {
    job_id: insight.jobId,
    fit_score:
      insight.fitScore != null
        ? {
            score: insight.fitScore,
            reasoning: isFitLabel(insight.fitLabel) ? FIT_LABEL_TEXT[insight.fitLabel] : '',
          }
        : null,
    cover_letter: insight.coverLetter ? { text: insight.coverLetter, word_count: 0 } : null,
    interview_angles: angles,
    summary: insight.summary,
    meta: {},
  };
}

'use client';

/**
 * AiInsightsPanel — per-job AI analysis card.
 *
 * Shows fit score, cover letter, and interview angles for a tracked job.
 * Uses SSE streaming for per-agent progress (useStreamPipeline).
 * Persists results to DB (JobAIInsight) so re-opening is instant.
 *
 * Consumes:
 *   - useQuery → getAIInsightAction (load from DB, staleTime Infinity)
 *   - useStreamPipeline → POST /api/ai/pipeline/stream (SSE)
 *   - saveAIInsightAction (persist result after generation)
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useStreamPipeline } from '@/hooks/useAIPipeline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getAIInsightAction, saveAIInsightAction } from '@/utils/actions';
import type { PipelineJobInput, PipelineUserProfile, PipelineResponse, InterviewAngle } from '@/lib/ai/pipeline-client';
import type { AIInsightType } from '@/utils/types';
import { PipelineProgress } from '@/components/jobs/pipeline-progress';
import { trackEvent } from '@/lib/analytics/posthog';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AiInsightsPanelProps = {
  job: PipelineJobInput;
  user?: PipelineUserProfile;
};

function FitScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-emerald-500/15 text-emerald-400' :
    score >= 50 ? 'bg-amber-500/15 text-amber-400' :
    'bg-red-500/15 text-red-400';

  return (
    <span className={cn('rounded-full px-3 py-1 text-sm font-bold tabular-nums', color)}>
      {score}/100
    </span>
  );
}

function CoverLetterSection({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <button
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        Cover Letter
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-black/20 p-3">
          {/* LLM output is markdown — render with remark-gfm for proper formatting */}
          <div className="prose prose-invert prose-xs max-w-none text-xs leading-relaxed text-muted-foreground [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightsResult({ data }: { data: PipelineResponse }) {
  return (
    <div className="flex flex-col gap-3">
      {data.summary && (
        <div className="prose prose-invert prose-sm max-w-none text-sm text-muted-foreground [&_p]:my-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.summary}</ReactMarkdown>
        </div>
      )}

      {data.fit_score && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Fit Score</span>
          <FitScoreBadge score={data.fit_score.score} />
          {data.fit_score.reasoning && (
            <span className="text-xs text-muted-foreground">{data.fit_score.reasoning}</span>
          )}
        </div>
      )}

      {data.cover_letter && (
        <CoverLetterSection text={data.cover_letter.text} />
      )}

      {data.interview_angles.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-muted-foreground">Interview Angles</p>
          <ul className="flex flex-col gap-2">
            {data.interview_angles.map((a: InterviewAngle, i: number) => (
              <li key={i} className="rounded-lg border border-border bg-black/10 p-2.5 text-xs">
                <p className="font-medium">{a.question}</p>
                <p className="mt-0.5 text-muted-foreground">{a.angle}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Convert DB insight to PipelineResponse shape for unified rendering. */
function dbInsightToPipelineResponse(insight: AIInsightType): PipelineResponse {
  const angles: InterviewAngle[] = insight.interviewAngles.map((raw) => {
    const sep = raw.indexOf(': ');
    return sep !== -1
      ? { question: raw.slice(0, sep), angle: raw.slice(sep + 2) }
      : { question: raw, angle: '' };
  });

  return {
    job_id: insight.jobId,
    fit_score: insight.fitScore != null ? { score: insight.fitScore, reasoning: insight.fitLabel ?? '' } : null,
    cover_letter: insight.coverLetter ? { text: insight.coverLetter, word_count: 0 } : null,
    interview_angles: angles,
    summary: insight.summary,
    meta: {},
  };
}

/** Convert PipelineResponse to DB insight shape for saving. */
function pipelineResponseToDbInsight(
  data: PipelineResponse
): Partial<Omit<AIInsightType, 'id' | 'jobId' | 'userId' | 'generatedAt' | 'updatedAt'>> {
  return {
    fitScore: data.fit_score?.score ?? null,
    fitLabel: data.fit_score?.reasoning ?? null,
    summary: data.summary ?? null,
    coverLetter: data.cover_letter?.text ?? null,
    interviewAngles: data.interview_angles.map(
      (a) => a.angle ? `${a.question}: ${a.angle}` : a.question
    ),
    redFlags: [],
  };
}

export function AiInsightsPanel({ job, user }: AiInsightsPanelProps) {
  const queryClient = useQueryClient();
  const insightKey = queryKeys.aiInsight.job(job.job_id);

  const [streamResult, setStreamResult] = useState<PipelineResponse | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Load persisted insight — staleTime Infinity since it only changes on explicit regenerate
  const { data: dbInsight, isLoading: dbLoading } = useQuery({
    queryKey: insightKey,
    queryFn: () => getAIInsightAction(job.job_id),
    staleTime: Infinity,
    gcTime: 0, // not in localStorage persist scope — DB is source of truth
  });

  const { stream, isPending, progress, abort } = useStreamPipeline();

  async function handleGenerate() {
    setStreamResult(null);
    setStreamError(null);

    await stream(
      {
        job,
        user: user ?? {},
        include: ['fit_score', 'cover_letter', 'interview_angles', 'summary'],
      },
      {
        onSuccess: async (result) => {
          setStreamResult(result);
          trackEvent('ai_insights_generated', { job_id: job.job_id, fit_score: result.fit_score?.score });
          // Persist to DB so next panel open is instant
          const saved = await saveAIInsightAction(job.job_id, pipelineResponseToDbInsight(result));
          if (saved) {
            queryClient.setQueryData(insightKey, saved);
          }
        },
        onError: (message) => {
          setStreamError(message);
        },
      }
    );
  }

  function handleRegenerate() {
    abort();
    setStreamResult(null);
    setStreamError(null);
    queryClient.setQueryData(insightKey, null);
    trackEvent('ai_insights_regenerated', { job_id: job.job_id });
  }

  // Show streaming result (just generated) or persisted DB result
  const displayData = streamResult ?? (dbInsight ? dbInsightToPipelineResponse(dbInsight) : null);
  const hasResult = !!displayData;
  const isFromDb = !streamResult && !!dbInsight;

  return (
    <GlassCard variant="neutral" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
          {isFromDb && (
            <span className="ml-1 text-xs font-normal text-muted-foreground/60">
              · saved {new Date(dbInsight!.generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {hasResult ? (
          <button
            onClick={handleRegenerate}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Regenerate
          </button>
        ) : isPending ? (
          <button
            onClick={handleRegenerate}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Cancel
          </button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={dbLoading}
            className="h-7 gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate Insights
          </Button>
        )}
      </div>

      {/* Per-agent progress — visible during streaming */}
      {isPending && (
        <PipelineProgress
          currentStep={progress.currentStep}
          completedSteps={progress.completedSteps}
        />
      )}

      {streamError && (
        <p className="text-xs text-destructive">
          {streamError}
        </p>
      )}

      {displayData && <InsightsResult data={displayData} />}

      {!displayData && !isPending && !streamError && !dbLoading && (
        <p className="text-xs text-muted-foreground">
          Get AI-powered fit score, cover letter, and interview coaching for this role.
        </p>
      )}
    </GlassCard>
  );
}

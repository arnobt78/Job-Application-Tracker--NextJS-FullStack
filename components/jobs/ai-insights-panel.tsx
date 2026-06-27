'use client';

/**
 * AiInsightsPanel — per-job AI analysis card.
 *
 * Shows fit score, cover letter, and interview angles for a tracked job.
 * Triggered manually ("Generate Insights") to avoid auto-firing expensive LLM calls.
 *
 * Consumes: useAIPipeline (mutation) — POST /api/ai/pipeline
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useAIPipeline } from '@/hooks/useAIPipeline';
import type { PipelineJobInput, PipelineUserProfile, PipelineResponse } from '@/lib/ai/pipeline-client';
import { cn } from '@/lib/utils';

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
        <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-black/20 p-3 text-xs leading-relaxed text-muted-foreground">
          {text}
        </pre>
      )}
    </div>
  );
}

function InsightsResult({ data }: { data: PipelineResponse }) {
  return (
    <div className="flex flex-col gap-3">
      {data.summary && (
        <p className="text-sm text-muted-foreground">{data.summary}</p>
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
            {data.interview_angles.map((a, i) => (
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

export function AiInsightsPanel({ job, user }: AiInsightsPanelProps) {
  const { mutate, data, isPending, isError, error, reset } = useAIPipeline();

  function handleGenerate() {
    mutate({
      job,
      user: user ?? {},
      include: ['fit_score', 'cover_letter', 'interview_angles', 'summary'],
    });
  }

  return (
    <GlassCard variant="neutral" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
        </div>

        {data ? (
          <button
            onClick={() => { reset(); }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Regenerate
          </button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={isPending}
            className="h-7 gap-1.5 text-xs"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {isPending ? 'Analysing…' : 'Generate Insights'}
          </Button>
        )}
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {error?.message ?? 'AI service unavailable. Try again later.'}
        </p>
      )}

      {data && <InsightsResult data={data} />}

      {!data && !isPending && !isError && (
        <p className="text-xs text-muted-foreground">
          Get AI-powered fit score, cover letter, and interview coaching for this role.
        </p>
      )}
    </GlassCard>
  );
}

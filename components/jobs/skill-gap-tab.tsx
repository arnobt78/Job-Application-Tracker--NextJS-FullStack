'use client';

/**
 * SkillGapTab — renders matched / missing / bonus skill lists for a job.
 *
 * Two modes:
 *   Keyword (default, instant) — computeSkillGap via getSkillGapAction
 *   AI Analysis (on-demand)   — LLM semantic match via getLLMSkillGapAction
 *
 * Keyword results are SSR-independent; AI results are lazy-fetched on toggle.
 * Neither is persisted — user skills + Bluedoor descriptions change too often.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Sparkles, UserCheck, BookOpen, AlertCircle, Loader2, GraduationCap, Brain } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import { getSkillGapAction, getLLMSkillGapAction } from '@/utils/actions';
import type { LLMSkillGapResult } from '@/utils/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = {
  jobId: string;
};

/** Circular gauge for match percentage */
function MatchGauge({ pct }: { pct: number }) {
  const color =
    pct >= 80
      ? 'text-emerald-400'
      : pct >= 60
      ? 'text-sky-400'
      : pct >= 40
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn('text-3xl font-bold tabular-nums', color)}>{pct}%</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">skill match</span>
    </div>
  );
}

/** Pill chip for a single skill */
function SkillChip({
  skill,
  variant,
}: {
  skill: string;
  variant: 'matched' | 'missing' | 'bonus';
}) {
  const styles = {
    matched: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    missing: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    bonus: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium',
        styles[variant]
      )}
    >
      {skill}
    </span>
  );
}

/** Section header with icon */
function SectionHeader({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className={cn('h-3.5 w-3.5', color)} />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="ml-auto text-xs text-muted-foreground/60">{count}</span>
    </div>
  );
}

/** Ordered learning path list from AI analysis */
function LearningPathSection({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Learning Path
        </span>
      </div>
      <ol className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[9px] font-bold text-violet-400">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SkillGapTab({ jobId }: Props) {
  const [aiMode, setAiMode] = useState(false);

  // Keyword analysis — always available, instant
  const keyword = useQuery({
    queryKey: queryKeys.skillGap(jobId),
    queryFn: () => getSkillGapAction(jobId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // LLM analysis — lazy-fetched only when user clicks "AI Analysis"
  const llm = useQuery({
    queryKey: queryKeys.skillGapAI(jobId),
    queryFn: () => getLLMSkillGapAction(jobId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: aiMode, // Only fetch when toggle is active
  });

  const activeQuery = aiMode ? llm : keyword;
  const { data, isLoading, isError, refetch } = activeQuery;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
          {aiMode ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <BookOpen className="h-5 w-5 animate-pulse" />
          )}
          <p className="text-xs">{aiMode ? 'AI analysing skills…' : 'Analysing skills…'}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <AlertCircle className="h-5 w-5 text-rose-400" />
        <p className="text-xs text-muted-foreground">
          {aiMode ? 'AI analysis failed. Switch to keyword mode.' : 'Failed to load skill gap.'}
        </p>
        <button
          type="button"
          onClick={() => {
            if (aiMode) setAiMode(false);
            else void refetch();
          }}
          className="text-xs text-primary hover:underline"
        >
          {aiMode ? 'Use keyword analysis' : 'Retry'}
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <UserCheck className="h-7 w-7 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium">No skills in your profile</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add skills to your{' '}
            <a href="/profile" className="text-primary hover:underline">
              profile
            </a>{' '}
            to see how well you match this job.
          </p>
        </div>
      </div>
    );
  }

  const { matched, missing, bonus, matchPct } = data;
  const aiData: LLMSkillGapResult | null =
    aiMode && 'aiExplanation' in data ? (data as LLMSkillGapResult) : null;
  const hasMatched = matched.length > 0;
  const hasMissing = missing.length > 0;
  const hasBonus = bonus.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Score header + AI toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border/20 bg-black/20 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold">Skill Match Score</p>
          <p className="text-xs text-muted-foreground">
            {matched.length} of {matched.length + missing.length} relevant skills matched
          </p>
          {aiData?.confidence && (
            <span className="mt-1 text-[10px] text-violet-400/80">
              AI confidence: {aiData.confidence}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <MatchGauge pct={matchPct} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAiMode((v) => !v)}
            className={cn(
              'h-6 gap-1 px-2 text-[10px]',
              aiMode
                ? 'text-violet-400 hover:text-violet-300'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {aiMode ? (
              <><BookOpen className="h-3 w-3" /> Keyword</>
            ) : (
              <><Brain className="h-3 w-3" /> AI Analysis</>
            )}
          </Button>
        </div>
      </div>

      {/* AI explanation */}
      {aiData?.aiExplanation && (
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wide">AI Insight</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{aiData.aiExplanation}</p>
        </div>
      )}

      {/* Matched skills */}
      {hasMatched && (
        <div>
          <SectionHeader
            icon={CheckCircle2}
            label="You have"
            count={matched.length}
            color="text-emerald-400"
          />
          <div className="flex flex-wrap gap-1.5">
            {matched.map((s) => (
              <SkillChip key={s} skill={s} variant="matched" />
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {hasMissing && (
        <div>
          <SectionHeader
            icon={XCircle}
            label="Skills to add"
            count={missing.length}
            color="text-rose-400"
          />
          <div className="flex flex-wrap gap-1.5">
            {missing.map((s) => (
              <SkillChip key={s} skill={s} variant="missing" />
            ))}
          </div>
        </div>
      )}

      {/* Bonus skills */}
      {hasBonus && (
        <div>
          <SectionHeader
            icon={Sparkles}
            label="Bonus skills"
            count={bonus.length}
            color="text-sky-400"
          />
          <div className="flex flex-wrap gap-1.5">
            {bonus.map((s) => (
              <SkillChip key={s} skill={s} variant="bonus" />
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground/60">
            Skills on your profile not explicitly listed in this job description
          </p>
        </div>
      )}

      {/* Learning path (AI mode only) */}
      {aiData && aiData.learningPath.length > 0 && (
        <LearningPathSection items={aiData.learningPath} />
      )}

      {!hasMatched && !hasMissing && !hasBonus && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No skill overlap detected — try adding more specific skills to your profile.
        </p>
      )}
    </div>
  );
}

'use client';

/**
 * SkillGapTab — renders matched / missing / bonus skill lists for a job.
 * Fetched on demand (not SSR-prefetched) via queryKeys.skillGap(jobId).
 * NOT persisted — Bluedoor description changes, user skills update frequently.
 */

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Sparkles, UserCheck, BookOpen, AlertCircle } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import { getSkillGapAction } from '@/utils/actions';
import { cn } from '@/lib/utils';

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

export function SkillGapTab({ jobId }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.skillGap(jobId),
    queryFn: () => getSkillGapAction(jobId),
    staleTime: 5 * 60 * 1000, // 5 min — Bluedoor descriptions don't change that often
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
          <BookOpen className="h-5 w-5 animate-pulse" />
          <p className="text-xs">Analysing skills…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <AlertCircle className="h-5 w-5 text-rose-400" />
        <p className="text-xs text-muted-foreground">Failed to load skill gap.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs text-primary hover:underline"
        >
          Retry
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
  const hasMatched = matched.length > 0;
  const hasMissing = missing.length > 0;
  const hasBonus = bonus.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Score header */}
      <div className="flex items-center justify-between rounded-xl border border-border/20 bg-black/20 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold">Skill Match Score</p>
          <p className="text-xs text-muted-foreground">
            {matched.length} of {matched.length + missing.length} relevant skills matched
          </p>
        </div>
        <MatchGauge pct={matchPct} />
      </div>

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

      {!hasMatched && !hasMissing && !hasBonus && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No skill overlap detected — try adding more specific skills to your profile.
        </p>
      )}
    </div>
  );
}

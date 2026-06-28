'use client';

/**
 * AIFitChip — inline fit score badge for JobCard.
 *
 * Color-coded by score:
 *   ≥80  emerald  strong fit
 *   60–79 sky     good fit
 *   40–59 amber   partial fit
 *   <40  rose     poor fit
 *
 * Returns null when fitScore is null/undefined (no AI insight yet).
 */
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  fitScore: number | null | undefined;
  className?: string;
};

const SCORE_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  sky:     'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  amber:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  rose:    'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'emerald';
  if (score >= 60) return 'sky';
  if (score >= 40) return 'amber';
  return 'rose';
}

export function AIFitChip({ fitScore, className }: Props) {
  if (fitScore == null) return null;
  const color = scoreColor(fitScore);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        SCORE_STYLES[color],
        className
      )}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {fitScore}% match
    </span>
  );
}

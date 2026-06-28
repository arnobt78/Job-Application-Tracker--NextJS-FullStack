'use client';

/**
 * JobEnrichmentBadge — shows live posting status fetched from Bluedoor.
 *
 * States:
 *  - No bluedoorJobId + has applyUrl → "Syncing…" (enrichment pending)
 *  - active → green "LIVE" pill
 *  - expired → red "CLOSED" pill
 *  - description changed   → amber "CHANGED" pill  (bluedoorChangedAt set)
 *  - salary added          → blue "SALARY ADDED" pill
 *  - No enrichment data    → null (renders nothing)
 *
 * All state is derived from JobType fields — no extra fetch needed.
 */

import { cn } from '@/lib/utils';
import type { JobType } from '@/utils/types';
import { Wifi, WifiOff, RefreshCw, DollarSign, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type JobEnrichmentBadgeProps = {
  job: JobType;
  /** Extra CSS — useful for positioning inside card header */
  className?: string;
};

type BadgeConfig = {
  label: string;
  icon: React.ReactNode;
  classes: string;
};

function resolveBadge(job: JobType): BadgeConfig | null {
  const { bluedoorJobId, bluedoorStatus, applyUrl, bluedoorSyncedAt,
          bluedoorChangedAt, bluedoorSalaryMin } = job;

  // No enrichment data and no URL → nothing to show
  if (!bluedoorJobId && !applyUrl) return null;

  // Has apply URL but enrichment not yet run → syncing indicator
  if (!bluedoorJobId && applyUrl) {
    return {
      label: 'Syncing',
      icon: <RefreshCw className="h-3 w-3 animate-spin" />,
      classes: 'bg-muted/60 text-muted-foreground border-muted-foreground/20',
    };
  }

  // Enrichment exists but status not yet fetched (shouldn't happen normally)
  if (!bluedoorStatus) return null;

  // Salary added — highest priority display (most valuable signal)
  if (
    bluedoorSalaryMin != null &&
    bluedoorSyncedAt &&
    bluedoorStatus === 'active'
  ) {
    return {
      label: 'Salary Added',
      icon: <DollarSign className="h-3 w-3" />,
      classes:
        'bg-sky-500/15 text-sky-400 border-sky-400/30 dark:text-sky-300',
    };
  }

  // Posting closed
  if (bluedoorStatus === 'expired') {
    return {
      label: 'Closed',
      icon: <WifiOff className="h-3 w-3" />,
      classes:
        'bg-rose-500/15 text-rose-400 border-rose-400/30 dark:text-rose-300',
    };
  }

  // Description changed since we first linked it
  if (bluedoorChangedAt && bluedoorStatus === 'active') {
    return {
      label: 'JD Changed',
      icon: <AlertTriangle className="h-3 w-3" />,
      classes:
        'bg-amber-500/15 text-amber-400 border-amber-400/30 dark:text-amber-300',
    };
  }

  // All good — actively live
  if (bluedoorStatus === 'active') {
    return {
      label: 'Live',
      icon: <Wifi className="h-3 w-3" />,
      classes:
        'bg-emerald-500/15 text-emerald-400 border-emerald-400/30 dark:text-emerald-300',
    };
  }

  return null;
}

export function JobEnrichmentBadge({ job, className }: JobEnrichmentBadgeProps) {
  const badge = resolveBadge(job);

  return (
    <AnimatePresence mode="wait">
      {badge && (
        <motion.span
          key={badge.label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
            'text-[10px] font-semibold uppercase tracking-wide',
            badge.classes,
            className
          )}
          title={`Bluedoor live posting status: ${badge.label}`}
        >
          {badge.icon}
          {badge.label}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

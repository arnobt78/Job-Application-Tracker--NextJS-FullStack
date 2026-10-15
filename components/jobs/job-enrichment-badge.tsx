'use client';

/**
 * JobEnrichmentBadge — status of the catalog posting linked to a tracked job.
 *
 * States (derived from the JobType snapshot — no extra fetch):
 *  - closed                         → red "CLOSED" pill
 *  - last change was salary_added   → blue "SALARY ADDED" pill
 *  - last change was jd_changed     → amber "JD CHANGED" pill
 *  - open, no change                → green "LIVE" pill
 *  - not linked                     → null (renders nothing)
 */

import { cn } from '@/lib/utils';
import type { JobType } from '@/utils/types';
import { Wifi, WifiOff, DollarSign, AlertTriangle } from 'lucide-react';
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
  const { postingId, postingStatus, postingChangeType } = job;
  if (!postingId || !postingStatus) return null;

  if (postingStatus === 'closed') {
    return {
      label: 'Closed',
      icon: <WifiOff className="h-3 w-3" />,
      classes: 'bg-rose-500/15 text-tone-rose border-rose-400/30',
    };
  }

  if (postingChangeType === 'salary_added') {
    return {
      label: 'Salary Added',
      icon: <DollarSign className="h-3 w-3" />,
      classes: 'bg-sky-500/15 text-tone-sky border-sky-400/30',
    };
  }

  if (postingChangeType === 'jd_changed') {
    return {
      label: 'JD Changed',
      icon: <AlertTriangle className="h-3 w-3" />,
      classes: 'bg-amber-500/15 text-tone-amber border-amber-400/30',
    };
  }

  return {
    label: 'Live',
    icon: <Wifi className="h-3 w-3" />,
    classes: 'bg-emerald-500/15 text-tone-emerald border-emerald-400/30',
  };
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
          title={`Linked posting status: ${badge.label}`}
        >
          {badge.icon}
          {badge.label}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

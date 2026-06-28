'use client';

/**
 * TimelineItem — single activity event row.
 *
 * Icon per event type:
 *   job_created     → PlusCircle (sky)
 *   enriched        → Zap (amber — Bluedoor matched this posting)
 *   posting_changed → RefreshCw (rose — posting content/status changed)
 *   ai_generated    → Sparkles (violet — AI insights generated)
 *
 * CompanyLogo shown left of text. Relative time shown on right.
 */

import { PlusCircle, Zap, RefreshCw, Sparkles, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType } from '@/utils/types';

// ─────────────────────────────────────────────
// Event meta — label + icon + color per type
// ─────────────────────────────────────────────

const EVENT_META: Record<
  TimelineEventType,
  { label: string; Icon: React.ElementType; color: string; dotColor: string }
> = {
  job_created: {
    label: 'Application added',
    Icon: PlusCircle,
    color: 'text-sky-400',
    dotColor: 'bg-sky-500/20 border-sky-400/50',
  },
  enriched: {
    label: 'Posting enriched',
    Icon: Zap,
    color: 'text-amber-400',
    dotColor: 'bg-amber-500/20 border-amber-400/50',
  },
  posting_changed: {
    label: 'Posting changed',
    Icon: RefreshCw,
    color: 'text-rose-400',
    dotColor: 'bg-rose-500/20 border-rose-400/50',
  },
  ai_generated: {
    label: 'AI insights generated',
    Icon: Sparkles,
    color: 'text-violet-400',
    dotColor: 'bg-violet-500/20 border-violet-400/50',
  },
};

// ─────────────────────────────────────────────
// Relative time formatter
// ─────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

type TimelineItemProps = {
  event: TimelineEvent;
  /** true when this is the last item — hides the connector line */
  isLast: boolean;
};

export function TimelineItem({ event, isLast }: TimelineItemProps) {
  const { label, Icon, color, dotColor } = EVENT_META[event.type];

  return (
    <div className="flex gap-3">
      {/* Left column: dot + connector line */}
      <div className="flex flex-col items-center">
        {/* Icon dot */}
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
            dotColor
          )}
        >
          <Icon className={cn('h-4 w-4', color)} />
        </span>
        {/* Connector line */}
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-white/10" />
        )}
      </div>

      {/* Right column: event content */}
      <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5 pb-5', isLast && 'pb-0')}>
        {/* Event label + time */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground/50">
            {relativeTime(new Date(event.timestamp))}
          </span>
        </div>

        {/* Job card */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/[0.07]">
          {/* Building2 fallback — no domain available from timeline events */}
          <Building2 className="h-5 w-5 shrink-0 text-muted-foreground/50" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-snug">
              {event.position}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {event.company}
              {event.detail && (
                <span className="ml-1.5 font-normal opacity-60">
                  · {event.detail}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

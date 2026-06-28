'use client';

/**
 * TimelineView — client component for /timeline page.
 *
 * Fetches events via TanStack Query (SSR-hydrated, staleTime 30s).
 * Groups events by date and renders TimelineItem rows separated by date chips.
 * Shows skeleton shimmer on cold load, empty state when no jobs exist.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getTimelineAction } from '@/utils/actions';
import { TimelineItem } from './timeline-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import type { TimelineEvent } from '@/utils/types';

// ─────────────────────────────────────────────
// Date grouping helpers
// ─────────────────────────────────────────────

function dateKey(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function groupByDate(
  events: TimelineEvent[]
): Array<{ dateLabel: string; events: TimelineEvent[] }> {
  const map = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const key = dateKey(new Date(event.timestamp));
    const group = map.get(key) ?? [];
    group.push(event);
    map.set(key, group);
  }
  return Array.from(map.entries()).map(([dateLabel, evts]) => ({
    dateLabel,
    events: evts,
  }));
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2 pb-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────

function TimelineEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
      <Clock className="h-10 w-10 opacity-30" />
      <p className="text-sm">No activity yet — add your first job application to get started.</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function TimelineView() {
  const { data: events, isLoading } = useQuery({
    queryKey: queryKeys.timeline(),
    queryFn: getTimelineAction,
    staleTime: 30_000,
    // Not in localStorage persist scope — server is source of truth
    gcTime: 60_000,
  });

  if (isLoading) return <TimelineSkeleton />;
  if (!events || events.length === 0) return <TimelineEmpty />;

  const groups = groupByDate(events);

  return (
    <div className="flex flex-col">
      {groups.map(({ dateLabel, events: groupEvents }) => (
        <div key={dateLabel}>
          {/* Date separator chip */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
              {dateLabel}
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Events in this date group */}
          <div className="flex flex-col">
            {groupEvents.map((event, idx) => (
              <TimelineItem
                key={event.id}
                event={event}
                isLast={
                  /* isLast within the group — hide connector on last item of last group */
                  idx === groupEvents.length - 1
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/lib/query-keys';
import { getPostingEventsAction } from '@/utils/actions';
import { Activity, CheckCircle2, XCircle, RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostingEvent, PostingEventType } from '@/lib/postings/types';

// ─────────────────────────────────────────────
// Event display helpers
// ─────────────────────────────────────────────

const EVENT_LABELS: Record<PostingEventType, string> = {
  created: 'Posting published',
  updated: 'Posting updated',
  closed: 'Posting closed',
  reopened: 'Posting reopened',
};

function eventIcon(type: PostingEventType) {
  switch (type) {
    case 'created':  return <CheckCircle2 className="h-3.5 w-3.5 text-ink-emerald" />;
    case 'closed':   return <XCircle className="h-3.5 w-3.5 text-ink-red" />;
    case 'reopened': return <RefreshCw className="h-3.5 w-3.5 text-ink-sky" />;
    default:         return <RefreshCw className="h-3.5 w-3.5 text-ink-amber" />;
  }
}

function eventDotColor(type: PostingEventType): string {
  switch (type) {
    case 'created':  return 'bg-emerald-400';
    case 'closed':   return 'bg-red-400';
    case 'reopened': return 'bg-sky-400';
    default:         return 'bg-amber-400';
  }
}

/** Salary events store `{ min, max, currency }` as the new value. */
function eventDetail({ fieldName, newValue }: PostingEvent): string | null {
  if (fieldName === 'salary' && newValue && typeof newValue === 'object') {
    const { min, max, currency } = newValue as { min?: number; max?: number; currency?: string };
    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency ?? 'USD',
      maximumFractionDigits: 0,
    });
    if (min != null && max != null) return `Salary ${fmt.format(min)} – ${fmt.format(max)}`;
    return null;
  }
  if (fieldName === 'description') return 'Job description changed';
  if (fieldName === 'title') return `Title: ${String(newValue)}`;
  if (fieldName === 'workplace_type') return `Work type: ${String(newValue)}`;
  return null;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

type PostingActivityTabProps = {
  postingId: string;
};

export function PostingActivityTab({ postingId }: PostingActivityTabProps) {
  const { data: events, isLoading, isError } = useQuery({
    queryKey: queryKeys.discover.events(postingId),
    queryFn: () => getPostingEventsAction(postingId),
    staleTime: 5 * 60 * 1_000,
    gcTime: 10 * 60 * 1_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-3 w-3 rounded-full" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-ink-red">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        Could not load posting activity.
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center text-xs text-muted-foreground">
        <Activity className="h-8 w-8 opacity-30" />
        <p>No posting activity recorded yet.</p>
        <p className="text-xs opacity-60">Events appear when the linked posting is updated or closed.</p>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-0 border-l border-border/40 pl-5">
      {events.map((event) => {
        const detail = eventDetail(event);
        return (
          <li key={event.id} className="relative pb-5 last:pb-0">
            {/* Timeline dot */}
            <span
              className={cn(
                'absolute -left-[1.18rem] mt-1 h-2 w-2 rounded-full ring-2 ring-background',
                eventDotColor(event.type)
              )}
            />

            <div className="flex items-start gap-1.5">
              {eventIcon(event.type)}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-medium leading-tight text-foreground/90">
                  {EVENT_LABELS[event.type]}
                </span>
                {detail && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {event.fieldName === 'salary' && (
                      <DollarSign className="h-3 w-3 shrink-0 text-ink-emerald" />
                    )}
                    {detail}
                  </span>
                )}
                <time className="text-[11px] text-muted-foreground/60">
                  {formatDate(event.observedAt)}
                </time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

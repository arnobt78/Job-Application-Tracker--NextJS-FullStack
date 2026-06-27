'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/lib/query-keys';
import { getBluedoorJobEventsAction } from '@/utils/actions';
import { Activity, CheckCircle2, XCircle, RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BluedoorEventType } from '@/lib/bluedoor/types';

// ─────────────────────────────────────────────
// Event display helpers
// ─────────────────────────────────────────────

function eventLabel(type: BluedoorEventType): string {
  switch (type) {
    case 'job.created':    return 'Posting published';
    case 'job.updated':    return 'Posting updated';
    case 'job.closed':     return 'Posting closed';
    case 'job.reopened':   return 'Posting reopened';
  }
}

function eventIcon(type: BluedoorEventType) {
  switch (type) {
    case 'job.created':  return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
    case 'job.closed':   return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    case 'job.reopened': return <RefreshCw className="h-3.5 w-3.5 text-sky-400" />;
    case 'job.updated':
    default:             return <RefreshCw className="h-3.5 w-3.5 text-amber-400" />;
  }
}

function eventDotColor(type: BluedoorEventType): string {
  switch (type) {
    case 'job.created':  return 'bg-emerald-400';
    case 'job.closed':   return 'bg-red-400';
    case 'job.reopened': return 'bg-sky-400';
    case 'job.updated':
    default:             return 'bg-amber-400';
  }
}

function eventDetail(fieldName: string | null, newValue: unknown): string | null {
  if (!fieldName) return null;
  if (fieldName === 'salary_min' || fieldName === 'salary_max') {
    return typeof newValue === 'number'
      ? `Salary updated to ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(newValue)}`
      : null;
  }
  if (fieldName === 'description_hash') return 'Job description changed';
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
  bluedoorJobId: string;
};

export function PostingActivityTab({ bluedoorJobId }: PostingActivityTabProps) {
  const { data: events, isLoading, isError } = useQuery({
    queryKey: queryKeys.discover.events(bluedoorJobId),
    queryFn: () => getBluedoorJobEventsAction(bluedoorJobId),
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
      <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-400">
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
        <p className="text-xs opacity-60">Events appear when Bluedoor detects job posting changes.</p>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-0 border-l border-border/40 pl-5">
      {events.map((event) => {
        const detail = eventDetail(event.field_name, event.new_value);
        return (
          <li key={event.event_id} className="relative pb-5 last:pb-0">
            {/* Timeline dot */}
            <span
              className={cn(
                'absolute -left-[1.18rem] mt-1 h-2 w-2 rounded-full ring-2 ring-background',
                eventDotColor(event.event_type)
              )}
            />

            <div className="flex items-start gap-1.5">
              {eventIcon(event.event_type)}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-medium leading-tight text-foreground/90">
                  {eventLabel(event.event_type)}
                </span>
                {detail && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {event.field_name?.startsWith('salary') && (
                      <DollarSign className="h-3 w-3 shrink-0 text-emerald-400" />
                    )}
                    {detail}
                  </span>
                )}
                <time className="text-[11px] text-muted-foreground/60">
                  {formatDate(event.observed_at)}
                </time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

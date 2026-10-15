'use client';

/**
 * DiscoverJobDetailsModal — full job description + metadata modal.
 *
 * Fetches the full posting via getPostingDetailsAction on open (on-demand,
 * not prefetched — rare action). Shows salary, location, workplace type,
 * full description text, and a Track Application CTA.
 */

import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassDialogContent } from '@/components/ui/glass-dialog-content';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  PlusCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { getPostingDetailsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useTrackDiscoverJobMutation } from '@/hooks/useJobsMutation';
import { AiInsightsPanel } from '@/components/jobs/ai-insights-panel';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  formatPostingSalary,
  toPostingPipelineInput,
  workplaceLabel,
  workplacePillClass,
} from '@/lib/discover/track-helpers';

// ─────────────────────────────────────────────
// Modal body
// ─────────────────────────────────────────────

function ModalSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex flex-col gap-2 pt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

type ModalBodyProps = {
  postingId: string;
  onClose: () => void;
};

function ModalBody({ postingId, onClose }: ModalBodyProps) {
  const [tracked, setTracked] = useState(false);
  const { mutate, isPending } = useTrackDiscoverJobMutation();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.discover.detail(postingId),
    queryFn: () => getPostingDetailsAction(postingId),
    // On-demand only — modal opens rarely; staleTime keeps it fresh for the session
    staleTime: 5 * 60 * 1_000,
    gcTime: 10 * 60 * 1_000,
  });

  if (isLoading) return <ModalSkeleton />;
  if (isError || !data) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Could not load job details. Please try again.
      </p>
    );
  }

  const job = data;
  const salary = formatPostingSalary(job);
  const workplace = workplaceLabel(job.workplaceType);

  function handleTrack() {
    mutate(job, {
      onSuccess: () => {
        setTracked(true);
        onClose();
      },
    });
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h2 className="flex items-start gap-2 text-base font-semibold leading-snug">
          <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {job.title}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {job.companyName}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.locationText}
          </span>
          {workplace && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                workplacePillClass(job.workplaceType)
              )}
            >
              {workplace}
            </span>
          )}
        </div>
      </div>

      {/* Salary */}
      {salary && (
        <div className="flex items-center gap-1.5 text-sm font-medium text-ink-emerald">
          <DollarSign className="h-4 w-4" />
          {salary}
          {job.salaryPeriod && (
            <span className="font-normal text-muted-foreground">/ {job.salaryPeriod}</span>
          )}
        </div>
      )}

      {/* Full description */}
      {job.description ? (
        <div className="overlay-scroll max-h-64 overflow-y-auto rounded-lg border border-border bg-glass-inset p-4">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {job.description}
          </pre>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No description available.</p>
      )}

      {/* AI Insights — on-demand fit score, cover letter, interview angles */}
      <AiInsightsPanel job={toPostingPipelineInput(job)} persist={false} />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-4 text-sm font-medium text-primary transition hover:bg-primary/10 hover:border-primary/40"
        >
          <ExternalLink className="h-4 w-4" />
          Apply
        </a>

        <Button
          size="sm"
          variant={tracked ? 'outline' : 'default'}
          disabled={isPending || tracked}
          onClick={handleTrack}
          className="ml-auto h-9 gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : tracked ? (
            <Check className="h-4 w-4 text-ink-emerald" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {tracked ? 'Tracked!' : 'Track Application'}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────

type DiscoverJobDetailsModalProps = {
  postingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DiscoverJobDetailsModal({
  postingId,
  open,
  onOpenChange,
}: DiscoverJobDetailsModalProps) {
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <GlassDialogContent description="View full job posting details">
        <GlassCard
          variant="sky"
          className="flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col overflow-hidden"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {open && (
            <ModalBody postingId={postingId} onClose={() => onOpenChange(false)} />
          )}
        </GlassCard>
      </GlassDialogContent>
    </Dialog>
  );
}

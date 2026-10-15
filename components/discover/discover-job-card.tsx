'use client';

/**
 * DiscoverJobCard — single catalog posting result card.
 *
 * "Track Application" uses useTrackDiscoverJobMutation: the posting snapshot is
 * written server-side and invalidateAllJobQueries fires on success — dashboard
 * updates immediately without navigation.
 */

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Briefcase,
  ExternalLink,
  PlusCircle,
  DollarSign,
  Check,
  Loader2,
  Search,
} from 'lucide-react';
import type { DiscoverPosting } from '@/lib/postings/types';
import { cn } from '@/lib/utils';
import { useTrackDiscoverJobMutation } from '@/hooks/useJobsMutation';
import { DiscoverJobDetailsModal } from '@/components/discover/discover-job-details-modal';
import { CompanyLogo } from '@/components/ui/company-logo';
import {
  formatPostingSalary,
  workplaceLabel,
  workplacePillClass,
} from '@/lib/discover/track-helpers';

type DiscoverJobCardProps = {
  job: DiscoverPosting;
};

export function DiscoverJobCard({ job }: DiscoverJobCardProps) {
  const salary = formatPostingSalary(job);
  const workplace = workplaceLabel(job.workplaceType);
  const [tracked, setTracked] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { mutate, isPending } = useTrackDiscoverJobMutation();

  function handleTrack() {
    mutate(job, {
      onSuccess: () => setTracked(true),
    });
  }

  return (
    <GlassCard
      variant="neutral"
      className={cn('flex flex-col gap-3', tracked && 'opacity-70')}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold leading-tight">
            <Briefcase className="h-4 w-4 shrink-0 text-primary" />
            {job.title}
          </h3>
          {workplace && (
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                workplacePillClass(job.workplaceType)
              )}
            >
              {workplace}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CompanyLogo domain={job.companyDomain} size={12} />
            {job.companyName}
          </span>
          {job.department && (
            <span className="text-muted-foreground/60">{job.department}</span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.locationText}
          </span>
        </div>
      </div>

      {salary && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-emerald">
          <DollarSign className="h-3.5 w-3.5" />
          {salary}
          {job.salaryPeriod && (
            <span className="font-normal text-muted-foreground">
              / {job.salaryPeriod}
            </span>
          )}
        </div>
      )}

      <DiscoverJobDetailsModal
        postingId={job.id}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <div className="mt-auto flex items-center gap-2">
        <button
          onClick={() => setDetailsOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-glass-fill px-3 text-xs font-medium text-muted-foreground transition hover:bg-glass-hover hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          Details
        </button>

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 text-xs font-medium text-primary transition hover:bg-primary/10 hover:border-primary/40"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Apply
        </a>

        <Button
          size="sm"
          variant={tracked ? 'outline' : 'default'}
          disabled={isPending || tracked}
          onClick={handleTrack}
          className="ml-auto h-8 gap-1.5 text-xs"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : tracked ? (
            <Check className="h-3.5 w-3.5 text-ink-emerald" />
          ) : (
            <PlusCircle className="h-3.5 w-3.5" />
          )}
          {tracked ? 'Tracked' : 'Track Application'}
        </Button>
      </div>
    </GlassCard>
  );
}

'use client';

/**
 * DiscoverJobCard — single Bluedoor job posting result card.
 *
 * "Track Application" uses useTrackDiscoverJobMutation so bluedoorJobId is
 * pre-seeded and invalidateAllJobQueries fires on success — dashboard updates
 * immediately without navigation.
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
import type { BluedoorJob } from '@/lib/bluedoor/types';
import { cn } from '@/lib/utils';
import { useTrackDiscoverJobMutation } from '@/hooks/useJobsMutation';
import { DiscoverJobDetailsModal } from '@/components/discover/discover-job-details-modal';
import { CompanyLogo } from '@/components/ui/company-logo';
import { extractDomain } from '@/lib/ui/company-logo';
import {
  cleanDiscoverLocation,
  resolveDiscoverCompanyName,
  toDiscoverTrackPayload,
  workplaceLabel,
  bluedoorEmploymentToJobMode,
} from '@/lib/discover/track-helpers';

function formatSalary(job: BluedoorJob): string | null {
  if (!job.salary_min && !job.salary_max) return null;
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: job.salary_currency ?? 'USD',
    maximumFractionDigits: 0,
  });
  if (job.salary_min && job.salary_max) {
    return `${fmt.format(job.salary_min)} – ${fmt.format(job.salary_max)}`;
  }
  if (job.salary_min) return `${fmt.format(job.salary_min)}+`;
  if (job.salary_max) return `Up to ${fmt.format(job.salary_max!)}`;
  return null;
}

type DiscoverJobCardProps = {
  job: BluedoorJob;
};

export function DiscoverJobCard({ job }: DiscoverJobCardProps) {
  const salary = formatSalary(job);
  const workplace = workplaceLabel(job.workplace_type);
  const [tracked, setTracked] = useState(false);
  const companyName = resolveDiscoverCompanyName(job.org_id, job.apply_url);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const { mutate, isPending } = useTrackDiscoverJobMutation();

  function handleTrack() {
    mutate(toDiscoverTrackPayload(job), {
      onSuccess: () => setTracked(true),
    });
  }

  const displayLocation = job.location_text
    ? cleanDiscoverLocation(job.location_text)
    : null;

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
                job.workplace_type === 'remote' &&
                  'bg-emerald-500/15 text-emerald-400',
                job.workplace_type === 'hybrid' &&
                  'bg-sky-500/15 text-sky-400',
                job.workplace_type === 'on_site' &&
                  'bg-amber-500/15 text-amber-400'
              )}
            >
              {workplace}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CompanyLogo domain={extractDomain(job.apply_url)} size={12} />
            {companyName}
          </span>
          {job.department && (
            <span className="text-muted-foreground/60">{job.department}</span>
          )}
          {job.location_text && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {displayLocation}
            </span>
          )}
        </div>
      </div>

      {salary && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <DollarSign className="h-3.5 w-3.5" />
          {salary}
          {job.salary_period && (
            <span className="font-normal text-muted-foreground">
              / {job.salary_period}
            </span>
          )}
        </div>
      )}

      {job.description_text && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {job.description_text.slice(0, 280)}
        </p>
      )}

      <DiscoverJobDetailsModal
        jobId={job.job_id}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <div className="mt-auto flex items-center gap-2">
        <button
          onClick={() => setDetailsOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 text-xs font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          Details
        </button>

        <a
          href={job.apply_url}
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
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <PlusCircle className="h-3.5 w-3.5" />
          )}
          {tracked ? 'Tracked' : 'Track Application'}
        </Button>
      </div>
    </GlassCard>
  );
}

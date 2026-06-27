'use client';

/**
 * DiscoverJobCard — single Bluedoor job posting result card.
 *
 * "Track Application" uses useCreateJobMutation (same as CreateJobForm) so
 * invalidateAllJobQueries fires on success, updating the dashboard grid
 * immediately without navigation. cleanLocation strips semicolon-joined
 * multi-location strings returned by Bluedoor.
 */

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Briefcase,
  Building2,
  ExternalLink,
  PlusCircle,
  DollarSign,
  Check,
  Loader2,
  Search,
} from 'lucide-react';
import type { BluedoorJob } from '@/lib/bluedoor/types';
import { JobStatus, JobMode } from '@/utils/types';
import { cn } from '@/lib/utils';
import { useCreateJobMutation } from '@/hooks/useJobsMutation';
import { DiscoverJobDetailsModal } from '@/components/discover/discover-job-details-modal';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Bluedoor returns semicolon-joined multi-location strings like
 * "Remote - TX, El Paso, TX; Remote - GA, GA". Return only the first entry.
 */
function cleanLocation(text: string): string {
  return text.split(';')[0].trim();
}

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

/**
 * Humanize Bluedoor org_id (e.g. "stripe-greenhouse" → "Stripe") for display and tracking.
 * Strips ATS provider suffix, splits on hyphens, title-cases each word.
 */
function formatOrgName(orgId: string): string {
  return orgId
    .replace(/-(greenhouse|lever|ashby|workday)$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function workplaceLabel(type: string | null): string {
  if (type === 'remote') return 'Remote';
  if (type === 'hybrid') return 'Hybrid';
  if (type === 'on_site') return 'On-site';
  return '';
}

/** Derive a clean JobMode from Bluedoor employment_type string */
function toJobMode(employment_type: string | null): JobMode {
  const t = (employment_type ?? '').toLowerCase();
  if (t.includes('part')) return JobMode.PartTime;
  if (t.includes('contract') || t.includes('1099')) return JobMode.Internship; // closest available
  if (t.includes('intern')) return JobMode.Internship;
  if (t.includes('temp')) return JobMode.PartTime;
  return JobMode.FullTime;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

type DiscoverJobCardProps = {
  job: BluedoorJob;
};

export function DiscoverJobCard({ job }: DiscoverJobCardProps) {
  const salary = formatSalary(job);
  const workplace = workplaceLabel(job.workplace_type);
  const [tracked, setTracked] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const { mutate, isPending } = useCreateJobMutation();

  function handleTrack() {
    const rawLocation = job.location_text ?? job.country ?? 'Unknown';
    mutate(
      {
        position: job.title,
        // Format org_id to human-readable name (e.g. "stripe-greenhouse" → "Stripe")
        company: formatOrgName(job.org_id),
        location: cleanLocation(rawLocation),
        status: JobStatus.Pending,
        mode: toJobMode(job.employment_type),
        applyUrl: job.apply_url,
      },
      {
        // Runs after mutation's built-in invalidation + toast
        onSuccess: (data) => {
          if (data) setTracked(true);
        },
      }
    );
  }

  // Display location — clean semicolon-joined multi-location strings
  const displayLocation = job.location_text
    ? cleanLocation(job.location_text)
    : null;

  return (
    <GlassCard
      variant="neutral"
      className={cn('flex flex-col gap-3', tracked && 'opacity-70')}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold leading-tight">
            <Briefcase className="h-4 w-4 shrink-0 text-primary" />
            {job.title}
          </h3>
          {/* Workplace badge */}
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

        {/* Company + location */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {/* Building2 shows the company (humanized org_id) */}
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {formatOrgName(job.org_id)}
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

      {/* Salary */}
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

      {/* Description preview — only when available (include=description was requested) */}
      {job.description_text && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {job.description_text.slice(0, 280)}
        </p>
      )}

      {/* Details modal */}
      <DiscoverJobDetailsModal
        jobId={job.job_id}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        {/* View full details modal */}
        <button
          onClick={() => setDetailsOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 text-xs font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          Details
        </button>

        {/* View original posting */}
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 text-xs font-medium text-primary transition hover:bg-primary/10 hover:border-primary/40"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Apply
        </a>

        {/* Track button — creates job in tracker */}
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

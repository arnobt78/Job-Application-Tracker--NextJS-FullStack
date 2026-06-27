'use client';

/**
 * DiscoverJobDetailsModal — full job description + metadata modal.
 *
 * Fetches full BluedoorJob via getBluedoorJobDetailsAction on open (on-demand,
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
import { getBluedoorJobDetailsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useCreateJobMutation } from '@/hooks/useJobsMutation';
import { AiInsightsPanel } from '@/components/jobs/ai-insights-panel';
import { JobStatus, JobMode } from '@/utils/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { BluedoorJob } from '@/lib/bluedoor/types';
import type { PipelineJobInput } from '@/lib/ai/pipeline-client';

// ─────────────────────────────────────────────
// Helpers (duplicated from discover-job-card to keep modal self-contained)
// ─────────────────────────────────────────────

function formatOrgName(orgId: string): string {
  return orgId
    .replace(/-(greenhouse|lever|ashby|workday)$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
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

function cleanLocation(text: string): string {
  return text.split(';')[0].trim();
}

function workplaceLabel(type: string | null): string {
  if (type === 'remote') return 'Remote';
  if (type === 'hybrid') return 'Hybrid';
  if (type === 'on_site') return 'On-site';
  return '';
}

function toJobMode(employment_type: string | null): JobMode {
  const t = (employment_type ?? '').toLowerCase();
  if (t.includes('part')) return JobMode.PartTime;
  if (t.includes('contract') || t.includes('1099')) return JobMode.Internship;
  if (t.includes('intern')) return JobMode.Internship;
  return JobMode.FullTime;
}

/** Map BluedoorJob → PipelineJobInput for the AI pipeline (uses Bluedoor job_id). */
function toBluedoorPipelineInput(job: BluedoorJob): PipelineJobInput {
  return {
    job_id: job.job_id,
    position: job.title,
    company: formatOrgName(job.org_id),
    location: job.location_text ? cleanLocation(job.location_text) : 'Unknown',
    status: 'pending', // not yet tracked in the user's pipeline
    mode: toJobMode(job.employment_type),
    apply_url: job.apply_url ?? null,
    bluedoor_status: job.active ? 'active' : 'expired',
    bluedoor_workplace_type: job.workplace_type ?? null,
    bluedoor_salary_min: job.salary_min ?? null,
    bluedoor_salary_max: job.salary_max ?? null,
    bluedoor_salary_currency: job.salary_currency ?? null,
  };
}

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
  jobId: string;
  onClose: () => void;
};

function ModalBody({ jobId, onClose }: ModalBodyProps) {
  const [tracked, setTracked] = useState(false);
  const { mutate, isPending } = useCreateJobMutation();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.discover.detail(jobId),
    queryFn: () => getBluedoorJobDetailsAction(jobId),
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

  const salary = formatSalary(data);
  const workplace = workplaceLabel(data.workplace_type);
  const location = data.location_text ? cleanLocation(data.location_text) : null;

  function handleTrack() {
    mutate(
      {
        position: data!.title,
        company: formatOrgName(data!.org_id),
        location: location ?? 'Unknown',
        status: JobStatus.Pending,
        mode: toJobMode(data!.employment_type),
        applyUrl: data!.apply_url,
      },
      {
        onSuccess: (created) => {
          if (created) {
            setTracked(true);
            setTimeout(onClose, 1_200);
          }
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h2 className="flex items-start gap-2 text-base font-semibold leading-snug">
          <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {data.title}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {formatOrgName(data.org_id)}
          </span>
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
          {workplace && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                data.workplace_type === 'remote' && 'bg-emerald-500/15 text-emerald-400',
                data.workplace_type === 'hybrid' && 'bg-sky-500/15 text-sky-400',
                data.workplace_type === 'on_site' && 'bg-amber-500/15 text-amber-400'
              )}
            >
              {workplace}
            </span>
          )}
        </div>
      </div>

      {/* Salary */}
      {salary && (
        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
          <DollarSign className="h-4 w-4" />
          {salary}
          {data.salary_period && (
            <span className="font-normal text-muted-foreground">/ {data.salary_period}</span>
          )}
        </div>
      )}

      {/* Full description */}
      {data.description_text ? (
        <div className="overlay-scroll max-h-64 overflow-y-auto rounded-lg border border-border bg-black/20 p-4">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {data.description_text}
          </pre>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No description available.</p>
      )}

      {/* AI Insights — on-demand fit score, cover letter, interview angles */}
      <AiInsightsPanel job={toBluedoorPipelineInput(data)} />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={data.apply_url}
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
            <Check className="h-4 w-4 text-emerald-400" />
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
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DiscoverJobDetailsModal({
  jobId,
  open,
  onOpenChange,
}: DiscoverJobDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <GlassDialogContent>
        <GlassCard variant="sky" className="flex h-full w-full flex-col overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {open && (
            <ModalBody jobId={jobId} onClose={() => onOpenChange(false)} />
          )}
        </GlassCard>
      </GlassDialogContent>
    </Dialog>
  );
}

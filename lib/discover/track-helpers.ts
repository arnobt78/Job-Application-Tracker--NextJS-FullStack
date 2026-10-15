/**
 * Discover → dashboard helpers: map a catalog posting to tracker form values,
 * plus display formatters shared by the Discover card and details modal.
 */
import type { DiscoverPosting } from '@/lib/postings/types';
import { JobMode, JobStatus, type CreateAndEditJobType } from '@/utils/types';
import type { PipelineJobInput } from '@/lib/ai/pipeline-client';

/** Ensure location meets createAndEditJobSchema min(2). */
export function resolveTrackLocation(
  locationText: string | null | undefined,
  country: string | null | undefined
): string {
  const cleaned = (locationText ?? '').trim();
  if (cleaned.length >= 2) return cleaned;
  if (country && country.trim().length >= 2) return country.trim();
  return 'Unknown';
}

export function employmentToJobMode(employmentType: string | null): JobMode {
  if (employmentType === 'part_time' || employmentType === 'temporary') return JobMode.PartTime;
  if (employmentType === 'internship') return JobMode.Internship;
  return JobMode.FullTime;
}

export function workplaceLabel(type: string | null): string {
  if (type === 'remote') return 'Remote';
  if (type === 'hybrid') return 'Hybrid';
  if (type === 'on_site') return 'On-site';
  return '';
}

/** Tailwind classes for the workplace pill — one palette for card and modal. */
export function workplacePillClass(type: string | null): string {
  if (type === 'remote') return 'bg-emerald-500/15 text-ink-emerald';
  if (type === 'hybrid') return 'bg-sky-500/15 text-ink-sky';
  if (type === 'on_site') return 'bg-amber-500/15 text-ink-amber';
  return '';
}

export function formatPostingSalary(
  posting: Pick<DiscoverPosting, 'salaryMin' | 'salaryMax' | 'salaryCurrency'>
): string | null {
  const { salaryMin, salaryMax } = posting;
  if (salaryMin == null && salaryMax == null) return null;
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: posting.salaryCurrency ?? 'USD',
    maximumFractionDigits: 0,
  });
  if (salaryMin != null && salaryMax != null) {
    return `${fmt.format(salaryMin)} – ${fmt.format(salaryMax)}`;
  }
  if (salaryMin != null) return `${fmt.format(salaryMin)}+`;
  return `Up to ${fmt.format(salaryMax!)}`;
}

/** Tracker form values for a posting — used by the server action and the optimistic UI. */
export function toTrackValues(
  posting: Pick<DiscoverPosting, 'title' | 'companyName' | 'locationText' | 'country' | 'employmentType' | 'applyUrl'>
): CreateAndEditJobType {
  return {
    position: posting.title.trim(),
    company: posting.companyName,
    location: resolveTrackLocation(posting.locationText, posting.country),
    status: JobStatus.Pending,
    mode: employmentToJobMode(posting.employmentType),
    applyUrl: posting.applyUrl,
  };
}

/** AI pipeline input for an untracked posting (Discover details modal). */
export function toPostingPipelineInput(posting: DiscoverPosting): PipelineJobInput {
  const values = toTrackValues(posting);
  return {
    job_id: posting.id,
    position: values.position,
    company: values.company,
    location: values.location,
    status: values.status,
    mode: values.mode,
    apply_url: posting.applyUrl,
    posting_status: posting.status,
    workplace_type: posting.workplaceType,
    salary_min: posting.salaryMin,
    salary_max: posting.salaryMax,
    salary_currency: posting.salaryCurrency,
  };
}

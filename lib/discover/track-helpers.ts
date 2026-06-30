/**
 * Discover → dashboard track helpers.
 * Maps Bluedoor search/detail payloads into tracker fields with safe fallbacks
 * (location min length, UUID org_id → apply URL domain company name).
 */
import type { BluedoorJob, JobEnrichmentPatch } from '@/lib/bluedoor/types';
import { JobMode } from '@/utils/types';
import { extractDomain } from '@/lib/ui/company-logo';

/** Bluedoor returns semicolon-joined multi-location strings — keep first entry only. */
export function cleanDiscoverLocation(text: string): string {
  return text.split(';')[0].trim();
}

/** Ensure location meets createAndEditJobSchema min(2) after cleaning. */
export function resolveTrackLocation(
  locationText: string | null | undefined,
  country: string | null | undefined
): string {
  const raw = locationText ?? country ?? '';
  const cleaned = raw ? cleanDiscoverLocation(raw) : '';
  if (cleaned.length >= 2) return cleaned;
  if (country && country.trim().length >= 2) return country.trim();
  return 'Unknown';
}

const UUID_LIKE =
  /^[0-9a-f]{8}[-\s]?[0-9a-f]{4}[-\s]?[0-9a-f]{4}[-\s]?[0-9a-f]{4}[-\s]?[0-9a-f]{12}$/i;

/** Humanize slug org_id (e.g. stripe-greenhouse → Stripe). */
export function formatOrgSlugName(orgId: string): string {
  return orgId
    .replace(/-(greenhouse|lever|ashby|workday)$/i, '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Prefer slug org name; fall back to apply URL domain when org_id is a UUID. */
export function resolveDiscoverCompanyName(
  orgId: string,
  applyUrl: string | null | undefined
): string {
  const normalizedOrg = orgId.replace(/\s+/g, '-').trim();
  const slugName = formatOrgSlugName(normalizedOrg);

  const looksLikeUuid =
    UUID_LIKE.test(orgId.replace(/\s/g, '')) ||
    UUID_LIKE.test(normalizedOrg);

  if (!looksLikeUuid && slugName.length >= 2 && !/^[0-9a-f\s-]+$/i.test(slugName)) {
    return slugName;
  }

  const domain = extractDomain(applyUrl ?? null);
  if (domain) {
    const parts = domain.split('.').filter(Boolean);
    const genericSubdomains = new Set(['www', 'jobs', 'careers', 'apply', 'job']);
    const label =
      parts.length > 1 && genericSubdomains.has(parts[0].toLowerCase())
        ? parts[1]
        : parts[0];
    if (label && label.length >= 2) {
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
  }

  if (slugName.length >= 2) return slugName;
  return 'Unknown Company';
}

/** Derive JobMode from Bluedoor employment_type string. */
export function bluedoorEmploymentToJobMode(employmentType: string | null): JobMode {
  const t = (employmentType ?? '').toLowerCase();
  if (t.includes('part')) return JobMode.PartTime;
  if (t.includes('contract') || t.includes('1099')) return JobMode.Internship;
  if (t.includes('intern')) return JobMode.Internship;
  if (t.includes('temp')) return JobMode.PartTime;
  return JobMode.FullTime;
}

export function workplaceLabel(type: string | null): string {
  if (type === 'remote') return 'Remote';
  if (type === 'hybrid') return 'Hybrid';
  if (type === 'on_site') return 'On-site';
  return '';
}

/** Serializable payload for trackJobFromDiscoverAction (no full JD). */
export type DiscoverTrackPayload = {
  jobId: string;
  orgId: string;
  title: string;
  applyUrl: string;
  locationText: string | null;
  country: string | null;
  employmentType: string | null;
  workplaceType: string | null;
  provider: string;
  active: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  contentHash: string | null;
  lastChangedAt: string | null;
};

export function toDiscoverTrackPayload(job: BluedoorJob): DiscoverTrackPayload {
  return {
    jobId: job.job_id,
    orgId: job.org_id,
    title: job.title,
    applyUrl: job.apply_url,
    locationText: job.location_text,
    country: job.country,
    employmentType: job.employment_type,
    workplaceType: job.workplace_type,
    provider: job.provider,
    active: job.active,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryCurrency: job.salary_currency,
    contentHash: job.event_fields?.content_hash ?? null,
    lastChangedAt: job.event_fields?.last_changed_at ?? null,
  };
}

/** Pre-seed enrichment columns when tracking directly from Discover (no enrich lookup). */
export function buildEnrichmentPatchFromDiscoverPayload(
  payload: DiscoverTrackPayload
): JobEnrichmentPatch {
  return {
    bluedoorJobId: payload.jobId,
    bluedoorOrgId: payload.orgId,
    bluedoorProvider: payload.provider,
    bluedoorStatus: payload.active ? 'active' : 'expired',
    bluedoorWorkplaceType: payload.workplaceType,
    bluedoorSalaryMin: payload.salaryMin,
    bluedoorSalaryMax: payload.salaryMax,
    bluedoorSalaryCurrency: payload.salaryCurrency,
    bluedoorDescHash: payload.contentHash,
    bluedoorSyncedAt: new Date(),
    bluedoorChangedAt: payload.lastChangedAt ? new Date(payload.lastChangedAt) : null,
  };
}

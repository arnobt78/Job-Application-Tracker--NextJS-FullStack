/**
 * Optimistic stats cache patches — mirrors getCachedStats field names (status + mode + total).
 * Used by useJobsMutation for instant dashboard portfolio breakdown updates.
 */
import type { StatsResult } from '@/lib/jobs/queries';
import type { CreateAndEditJobType, JobType } from '@/utils/types';
import { JobMode, JobStatus } from '@/utils/types';

export type StatsCache = StatsResult | undefined;

type StatsCountField =
  | 'pending'
  | 'interview'
  | 'declined'
  | 'fullTime'
  | 'partTime'
  | 'internship'
  | 'total';

const STATUS_FIELDS: ReadonlySet<string> = new Set([
  JobStatus.Pending,
  JobStatus.Interview,
  JobStatus.Declined,
]);

const MODE_TO_FIELD: Record<string, StatsCountField> = {
  [JobMode.FullTime]: 'fullTime',
  [JobMode.PartTime]: 'partTime',
  [JobMode.Internship]: 'internship',
};

/** Map DB status string to StatsResult count field (validated) */
export function statusToStatsKey(status: string): StatsCountField | null {
  const normalized = status.toLowerCase();
  if (STATUS_FIELDS.has(normalized)) {
    return normalized as 'pending' | 'interview' | 'declined';
  }
  return null;
}

/** Map DB mode string to StatsResult count field (validated) */
export function modeToStatsKey(mode: string): StatsCountField | null {
  return MODE_TO_FIELD[mode.toLowerCase()] ?? null;
}

/** Bump a single numeric stats field; floors at zero */
export function bumpStatsField(
  stats: StatsCache,
  field: StatsCountField,
  delta: number
): StatsCache {
  if (!stats || delta === 0) return stats;
  return {
    ...stats,
    [field]: Math.max(0, (stats[field] ?? 0) + delta),
  };
}

/** +1 status, +1 mode, +1 total on job create */
export function applyStatsCreate(
  stats: StatsCache,
  values: CreateAndEditJobType
): StatsCache {
  if (!stats) return stats;
  let next = stats;
  const statusKey = statusToStatsKey(values.status);
  const modeKey = modeToStatsKey(values.mode);
  if (statusKey) next = bumpStatsField(next, statusKey, 1) ?? next;
  if (modeKey) next = bumpStatsField(next, modeKey, 1) ?? next;
  return bumpStatsField(next, 'total', 1) ?? next;
}

type JobStatsSlice = { status?: string; mode?: string };

/** Swap status and/or mode counts when job fields change; total unchanged */
export function applyStatsUpdate(
  stats: StatsCache,
  previous: JobStatsSlice,
  values: CreateAndEditJobType
): StatsCache {
  if (!stats) return stats;
  let next = stats;

  if (previous.status && previous.status !== values.status) {
    const oldKey = statusToStatsKey(previous.status);
    const newKey = statusToStatsKey(values.status);
    if (oldKey) next = bumpStatsField(next, oldKey, -1) ?? next;
    if (newKey) next = bumpStatsField(next, newKey, 1) ?? next;
  }

  if (previous.mode && previous.mode !== values.mode) {
    const oldKey = modeToStatsKey(previous.mode);
    const newKey = modeToStatsKey(values.mode);
    if (oldKey) next = bumpStatsField(next, oldKey, -1) ?? next;
    if (newKey) next = bumpStatsField(next, newKey, 1) ?? next;
  }

  return next;
}

/** -1 status, -1 mode, -1 total on job delete */
export function applyStatsDelete(stats: StatsCache, job: JobType): StatsCache {
  if (!stats) return stats;
  let next = stats;
  const statusKey = statusToStatsKey(job.status);
  const modeKey = modeToStatsKey(job.mode);
  if (statusKey) next = bumpStatsField(next, statusKey, -1) ?? next;
  if (modeKey) next = bumpStatsField(next, modeKey, -1) ?? next;
  return bumpStatsField(next, 'total', -1) ?? next;
}

/** Canonical filter dropdown options for dashboard jobs list */

import { JobMode, JobStatus } from '@/utils/types';
import { formatEnumLabel } from '@/lib/ui/format-label';

export type FilterOption = {
  value: string;
  label: string;
};

export const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: JobStatus.Pending, label: formatEnumLabel(JobStatus.Pending) },
  { value: JobStatus.Interview, label: formatEnumLabel(JobStatus.Interview) },
  { value: JobStatus.Declined, label: formatEnumLabel(JobStatus.Declined) },
];

export const MODE_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Modes' },
  { value: JobMode.FullTime, label: formatEnumLabel(JobMode.FullTime) },
  { value: JobMode.PartTime, label: formatEnumLabel(JobMode.PartTime) },
  { value: JobMode.Internship, label: formatEnumLabel(JobMode.Internship) },
];

export const MONTH_ALL_OPTION: FilterOption = {
  value: 'all',
  label: 'All Months',
};

/** Job form status options — no "all", capitalized labels */
export const JOB_FORM_STATUS_OPTIONS: FilterOption[] = [
  { value: JobStatus.Pending, label: formatEnumLabel(JobStatus.Pending) },
  { value: JobStatus.Interview, label: formatEnumLabel(JobStatus.Interview) },
  { value: JobStatus.Declined, label: formatEnumLabel(JobStatus.Declined) },
];

/** Job form mode options — no "all", capitalized labels */
export const JOB_FORM_MODE_OPTIONS: FilterOption[] = [
  { value: JobMode.FullTime, label: formatEnumLabel(JobMode.FullTime) },
  { value: JobMode.PartTime, label: formatEnumLabel(JobMode.PartTime) },
  { value: JobMode.Internship, label: formatEnumLabel(JobMode.Internship) },
];

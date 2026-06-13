/** URL-driven dashboard job list filters (bookmarkable via searchParams) */

export type JobsListFilters = {
  search: string;
  jobStatus: string;
  jobMode: string;
  monthYear: string;
  page: number;
};

export type JobFilterMonthOption = {
  value: string;
  label: string;
};

export type JobFilterOptions = {
  months: JobFilterMonthOption[];
};

export const DEFAULT_JOBS_LIST_FILTERS: JobsListFilters = {
  search: '',
  jobStatus: 'all',
  jobMode: 'all',
  monthYear: 'all',
  page: 1,
};

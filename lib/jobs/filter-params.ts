/**
 * Shared dashboard list filter parsing — URL is bookmarkable source of truth.
 * Server prefetch (page.tsx) and client hooks must use the same defaults/parser.
 */

import {
  DEFAULT_JOBS_LIST_FILTERS,
  type JobsListFilters,
} from '@/lib/jobs/filter-types';

/** Raw searchParams from Next.js dashboard page (server) */
export type JobsListSearchParamsRecord = {
  search?: string;
  jobStatus?: string;
  jobMode?: string;
  monthYear?: string;
  page?: string;
};

/** Parse client URLSearchParams into canonical filter object */
export function parseJobsListFilters(
  searchParams: URLSearchParams
): JobsListFilters {
  return {
    search: searchParams.get('search') ?? DEFAULT_JOBS_LIST_FILTERS.search,
    jobStatus:
      searchParams.get('jobStatus') ?? DEFAULT_JOBS_LIST_FILTERS.jobStatus,
    jobMode: searchParams.get('jobMode') ?? DEFAULT_JOBS_LIST_FILTERS.jobMode,
    monthYear:
      searchParams.get('monthYear') ?? DEFAULT_JOBS_LIST_FILTERS.monthYear,
    page:
      Number(searchParams.get('page')) || DEFAULT_JOBS_LIST_FILTERS.page,
  };
}

/** Parse awaited searchParams record from server page.tsx */
export function parseJobsListFiltersFromSearchParamsRecord(
  record: JobsListSearchParamsRecord
): JobsListFilters {
  return {
    search: record.search ?? DEFAULT_JOBS_LIST_FILTERS.search,
    jobStatus: record.jobStatus ?? DEFAULT_JOBS_LIST_FILTERS.jobStatus,
    jobMode: record.jobMode ?? DEFAULT_JOBS_LIST_FILTERS.jobMode,
    monthYear: record.monthYear ?? DEFAULT_JOBS_LIST_FILTERS.monthYear,
    page: Number(record.page) || DEFAULT_JOBS_LIST_FILTERS.page,
  };
}

/** Build URL query string parts — omits default/all values for clean bookmark URLs */
export function buildJobsListSearchParams(
  filters: JobsListFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.jobStatus && filters.jobStatus !== 'all') {
    params.set('jobStatus', filters.jobStatus);
  }
  if (filters.jobMode && filters.jobMode !== 'all') {
    params.set('jobMode', filters.jobMode);
  }
  if (filters.monthYear && filters.monthYear !== 'all') {
    params.set('monthYear', filters.monthYear);
  }
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

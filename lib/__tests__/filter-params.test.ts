import { describe, expect, it } from 'vitest';
import {
  buildJobsListSearchParams,
  clearedJobsListFilters,
  hasActiveJobsFilters,
  parseJobsListFilters,
  parseJobsListFiltersFromSearchParamsRecord,
} from '@/lib/jobs/filter-params';
import { DEFAULT_JOBS_LIST_FILTERS } from '@/lib/jobs/filter-types';

describe('filter-params', () => {
  it('returns defaults when URL params are empty', () => {
    const filters = parseJobsListFilters(new URLSearchParams());
    expect(filters).toEqual(DEFAULT_JOBS_LIST_FILTERS);
  });

  it('parses server searchParams record with same defaults as client', () => {
    expect(parseJobsListFiltersFromSearchParamsRecord({})).toEqual(
      DEFAULT_JOBS_LIST_FILTERS
    );
  });

  it('round-trips parse → build → parse', () => {
    const input = new URLSearchParams({
      search: 'engineer',
      jobStatus: 'pending',
      jobMode: 'full-time',
      monthYear: '2026-01',
      page: '2',
    });
    const parsed = parseJobsListFilters(input);
    const rebuilt = buildJobsListSearchParams(parsed);
    expect(parseJobsListFilters(rebuilt)).toEqual(parsed);
  });

  it('omits default all values and page 1 from built URL', () => {
    const params = buildJobsListSearchParams(DEFAULT_JOBS_LIST_FILTERS);
    expect(params.toString()).toBe('');
  });

  it('defaults invalid page to 1', () => {
    const filters = parseJobsListFilters(
      new URLSearchParams({ page: '0' })
    );
    expect(filters.page).toBe(1);
  });

  it('hasActiveJobsFilters is false for defaults', () => {
    expect(hasActiveJobsFilters(DEFAULT_JOBS_LIST_FILTERS)).toBe(false);
  });

  it('hasActiveJobsFilters is true when any filter differs', () => {
    expect(
      hasActiveJobsFilters({ ...DEFAULT_JOBS_LIST_FILTERS, search: 'dev' })
    ).toBe(true);
    expect(
      hasActiveJobsFilters({ ...DEFAULT_JOBS_LIST_FILTERS, jobStatus: 'pending' })
    ).toBe(true);
    expect(
      hasActiveJobsFilters({ ...DEFAULT_JOBS_LIST_FILTERS, jobMode: 'full-time' })
    ).toBe(true);
    expect(
      hasActiveJobsFilters({ ...DEFAULT_JOBS_LIST_FILTERS, monthYear: '2026-01' })
    ).toBe(true);
  });

  it('clearedJobsListFilters returns fresh defaults', () => {
    expect(clearedJobsListFilters()).toEqual(DEFAULT_JOBS_LIST_FILTERS);
    expect(clearedJobsListFilters()).not.toBe(DEFAULT_JOBS_LIST_FILTERS);
  });
});

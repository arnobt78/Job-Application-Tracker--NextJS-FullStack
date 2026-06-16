import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { getQueryBodyLoadingState } from '@/lib/query-body-loading';
import { queryKeys } from '@/lib/query-keys';

describe('getQueryBodyLoadingState', () => {
  it('returns true when loading and cache is cold', () => {
    const qc = new QueryClient();
    const key = queryKeys.stats.all;
    expect(getQueryBodyLoadingState(qc, key, true)).toBe(true);
  });

  it('returns false when loading but SSR/hydration seeded data', () => {
    const qc = new QueryClient();
    const key = queryKeys.stats.all;
    qc.setQueryData(key, { pending: 1, interview: 2, declined: 0, total: 3 });
    expect(getQueryBodyLoadingState(qc, key, true)).toBe(false);
  });

  it('treats empty array seed as warm cache', () => {
    const qc = new QueryClient();
    const key = queryKeys.jobs.filterOptions;
    qc.setQueryData(key, { months: [] });
    expect(getQueryBodyLoadingState(qc, key, true)).toBe(false);
  });

  it('returns false when not loading', () => {
    const qc = new QueryClient();
    const key = queryKeys.stats.all;
    expect(getQueryBodyLoadingState(qc, key, false)).toBe(false);
  });
});

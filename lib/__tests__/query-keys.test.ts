import { describe, expect, it } from 'vitest';
import { queryKeys } from '@/lib/query-keys';

describe('query-keys', () => {
  it('uses stable root keys for invalidation prefixes', () => {
    expect(queryKeys.jobs.all).toEqual(['jobs']);
    expect(queryKeys.stats.all).toEqual(['stats']);
    expect(queryKeys.charts.all).toEqual(['charts']);
  });

  it('builds list keys from filter params', () => {
    expect(
      queryKeys.jobs.list('engineer', 'pending', 'full-time', '2026-01', 2)
    ).toEqual(['jobs', 'engineer', 'pending', 'full-time', '2026-01', 2]);
  });

  it('builds detail keys from job id', () => {
    expect(queryKeys.job.detail('abc')).toEqual(['job', 'abc']);
  });
});

import { describe, expect, it } from 'vitest';
import { mergeJobIntoListResult } from '@/lib/jobs/list-cache';
import type { JobsListResult } from '@/lib/jobs/queries';
import type { JobType } from '@/utils/types';

const baseJob = (id: string): JobType => ({
  id,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'u1',
  position: 'Dev',
  company: 'Co',
  location: 'Remote',
  status: 'pending',
  mode: 'full-time',
});

describe('list-cache', () => {
  it('seeds and replaces optimistic rows with the server job', () => {
    const old: JobsListResult = {
      jobs: [baseJob('optimistic-1')],
      count: 1,
      page: 1,
      totalPages: 1,
    };
    const created = { ...baseJob('real-1'), bluedoorJobId: 'bd-1' };
    const next = mergeJobIntoListResult(old, created);
    expect(next.jobs).toHaveLength(1);
    expect(next.jobs[0].id).toBe('real-1');
    expect(next.count).toBe(1);
  });

  it('does not duplicate by bluedoorJobId', () => {
    const existing = { ...baseJob('j1'), bluedoorJobId: 'bd-1' };
    const old: JobsListResult = {
      jobs: [existing],
      count: 1,
      page: 1,
      totalPages: 1,
    };
    const next = mergeJobIntoListResult(old, { ...baseJob('j2'), bluedoorJobId: 'bd-1' });
    expect(next.jobs).toHaveLength(1);
  });
});

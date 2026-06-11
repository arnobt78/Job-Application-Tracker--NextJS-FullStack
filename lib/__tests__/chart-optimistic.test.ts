import { describe, expect, it } from 'vitest';
import { bumpChartMonth } from '@/lib/jobs/chart-optimistic';

describe('bumpChartMonth', () => {
  it('increments an existing month bucket', () => {
    const charts = [{ date: 'Jun 26', count: 3 }];
    const result = bumpChartMonth(charts, new Date('2026-06-15'), 1);
    expect(result).toEqual([{ date: 'Jun 26', count: 4 }]);
  });

  it('adds a new month bucket when incrementing', () => {
    const result = bumpChartMonth([], new Date('2026-06-15'), 1);
    expect(result).toEqual([{ date: 'Jun 26', count: 1 }]);
  });

  it('decrements and removes bucket when count hits zero', () => {
    const charts = [{ date: 'Jun 26', count: 1 }];
    const result = bumpChartMonth(charts, new Date('2026-06-15'), -1);
    expect(result).toEqual([]);
  });
});

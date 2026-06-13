import { describe, expect, it } from 'vitest';
import {
  formatMonthYearLabelUtc,
  monthRangeFromYearMonthUtc,
  monthYearKeyUtc,
} from '@/lib/jobs/month-utc';

describe('month-utc', () => {
  it('buckets createdAt as YYYY-MM in UTC', () => {
    const date = new Date('2026-01-15T12:00:00.000Z');
    expect(monthYearKeyUtc(date)).toBe('2026-01');
  });

  it('returns UTC start/end for a valid monthYear', () => {
    const range = monthRangeFromYearMonthUtc('2026-01');
    expect(range).not.toBeNull();
    expect(range!.gte.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(range!.lte.toISOString()).toBe('2026-01-31T23:59:59.999Z');
  });

  it('returns null for invalid or all monthYear', () => {
    expect(monthRangeFromYearMonthUtc('all')).toBeNull();
    expect(monthRangeFromYearMonthUtc('bad')).toBeNull();
  });

  it('formats dropdown label in UTC-stable MMM YYYY', () => {
    expect(formatMonthYearLabelUtc('2026-01')).toBe('Jan 2026');
  });
});

import { describe, expect, it } from 'vitest';
import { formatJobDate } from '@/lib/format-date';

describe('formatJobDate', () => {
  it('uses UTC so midnight Zulu dates stay stable across timezones', () => {
    expect(formatJobDate('2026-02-03T23:00:00.000Z')).toBe('2/3/2026');
    expect(formatJobDate('2026-02-02T23:00:00.000Z')).toBe('2/2/2026');
  });
});

import { describe, expect, it } from 'vitest';
import {
  allUserTags,
  chartsTag,
  jobsTag,
  statsTag,
} from '@/lib/cache-tags';

describe('cache-tags', () => {
  const userId = 'user_abc123';

  it('builds per-user tag names', () => {
    expect(jobsTag(userId)).toBe('jobs-user_abc123');
    expect(statsTag(userId)).toBe('stats-user_abc123');
    expect(chartsTag(userId)).toBe('charts-user_abc123');
  });

  it('returns all tags for invalidation loop', () => {
    expect(allUserTags(userId)).toEqual([
      'jobs-user_abc123',
      'stats-user_abc123',
      'charts-user_abc123',
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  fixedUserRedisKeys,
  scanUserRedisPatterns,
} from '@/lib/redis';

describe('redis invalidation keys', () => {
  it('uses colon keys that match queries.ts redisKey format', () => {
    const userId = 'user_abc';
    expect(fixedUserRedisKeys(userId)).toEqual([
      'stats:user_abc',
      'charts:user_abc',
      'charts-weekly:user_abc',
      'job-filter-options:user_abc',
      // Default dashboard list key — always purged explicitly to avoid Upstash SCAN miss
      'jobs:user_abc::all:all:all:1:10',
    ]);
    expect(scanUserRedisPatterns(userId)).toEqual([
      'jobs:user_abc:*',
      'job:user_abc:*',
    ]);
    // Old broken tag-format keys must NOT appear
    expect(fixedUserRedisKeys(userId)).not.toContain(`jobs-${userId}`);
    expect(fixedUserRedisKeys(userId)).not.toContain(`jobs-user_abc`);
  });

  it('default list key matches getCachedJobs redisKey format for zero-filter page 1', () => {
    // Mirrors: `jobs:${userId}:${search}:${jobStatus}:${jobMode}:${monthYear}:${page}:${limit}`
    // with search='', jobStatus='all', jobMode='all', monthYear='all', page=1, limit=10
    const userId = 'cmqxzosqc0000rgvhl54o1n8v';
    const keys = fixedUserRedisKeys(userId);
    expect(keys).toContain(`jobs:${userId}::all:all:all:1:10`);
  });
});

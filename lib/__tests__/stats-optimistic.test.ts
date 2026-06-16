import { describe, expect, it } from 'vitest';
import {
  applyStatsCreate,
  applyStatsDelete,
  applyStatsUpdate,
  bumpStatsField,
  modeToStatsKey,
  statusToStatsKey,
} from '@/lib/jobs/stats-optimistic';
import type { StatsResult } from '@/lib/jobs/queries';
import { JobMode, JobStatus } from '@/utils/types';

const baseStats: StatsResult = {
  pending: 5,
  interview: 3,
  declined: 2,
  fullTime: 6,
  partTime: 2,
  internship: 2,
  total: 10,
};

describe('statusToStatsKey / modeToStatsKey', () => {
  it('maps known status and mode values', () => {
    expect(statusToStatsKey(JobStatus.Pending)).toBe('pending');
    expect(modeToStatsKey(JobMode.FullTime)).toBe('fullTime');
    expect(modeToStatsKey(JobMode.PartTime)).toBe('partTime');
    expect(modeToStatsKey(JobMode.Internship)).toBe('internship');
  });

  it('returns null for unknown values', () => {
    expect(statusToStatsKey('unknown')).toBeNull();
    expect(modeToStatsKey('contract')).toBeNull();
  });
});

describe('bumpStatsField', () => {
  it('floors counts at zero', () => {
    const result = bumpStatsField(
      { ...baseStats, pending: 0 },
      'pending',
      -1
    );
    expect(result?.pending).toBe(0);
  });
});

describe('applyStatsCreate', () => {
  it('increments status, mode, and total', () => {
    const result = applyStatsCreate(baseStats, {
      position: 'Dev',
      company: 'Co',
      location: 'Remote',
      status: JobStatus.Interview,
      mode: JobMode.PartTime,
    });
    expect(result).toEqual({
      ...baseStats,
      interview: 4,
      partTime: 3,
      total: 11,
    });
  });
});

describe('applyStatsUpdate', () => {
  it('swaps status only', () => {
    const result = applyStatsUpdate(
      baseStats,
      { status: JobStatus.Pending, mode: JobMode.FullTime },
      {
        position: 'Dev',
        company: 'Co',
        location: 'Remote',
        status: JobStatus.Interview,
        mode: JobMode.FullTime,
      }
    );
    expect(result?.pending).toBe(4);
    expect(result?.interview).toBe(4);
    expect(result?.total).toBe(10);
  });

  it('swaps mode only', () => {
    const result = applyStatsUpdate(
      baseStats,
      { status: JobStatus.Pending, mode: JobMode.FullTime },
      {
        position: 'Dev',
        company: 'Co',
        location: 'Remote',
        status: JobStatus.Pending,
        mode: JobMode.Internship,
      }
    );
    expect(result?.fullTime).toBe(5);
    expect(result?.internship).toBe(3);
    expect(result?.total).toBe(10);
  });

  it('swaps both status and mode', () => {
    const result = applyStatsUpdate(
      baseStats,
      { status: JobStatus.Pending, mode: JobMode.FullTime },
      {
        position: 'Dev',
        company: 'Co',
        location: 'Remote',
        status: JobStatus.Declined,
        mode: JobMode.PartTime,
      }
    );
    expect(result?.pending).toBe(4);
    expect(result?.declined).toBe(3);
    expect(result?.fullTime).toBe(5);
    expect(result?.partTime).toBe(3);
  });

  it('no-op when status and mode unchanged', () => {
    const result = applyStatsUpdate(
      baseStats,
      { status: JobStatus.Pending, mode: JobMode.FullTime },
      {
        position: 'Dev',
        company: 'Co',
        location: 'Remote',
        status: JobStatus.Pending,
        mode: JobMode.FullTime,
      }
    );
    expect(result).toEqual(baseStats);
  });
});

describe('applyStatsDelete', () => {
  it('decrements status, mode, and total', () => {
    const result = applyStatsDelete(baseStats, {
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      clerkId: 'u1',
      position: 'Dev',
      company: 'Co',
      location: 'Remote',
      status: JobStatus.Pending,
      mode: JobMode.FullTime,
    });
    expect(result).toEqual({
      ...baseStats,
      pending: 4,
      fullTime: 5,
      total: 9,
    });
  });
});

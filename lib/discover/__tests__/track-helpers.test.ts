import { describe, expect, it } from 'vitest';
import {
  employmentToJobMode,
  formatPostingSalary,
  resolveTrackLocation,
  toPostingPipelineInput,
  toTrackValues,
} from '@/lib/discover/track-helpers';
import type { DiscoverPosting } from '@/lib/postings/types';
import { JobMode, JobStatus } from '@/utils/types';

const posting: DiscoverPosting = {
  id: 'p1',
  title: '  Senior Frontend Engineer ',
  department: 'Engineering',
  description: null,
  locationText: 'Toronto, ON',
  city: 'Toronto',
  region: 'ON',
  country: 'Canada',
  workplaceType: 'hybrid',
  employmentType: 'contract',
  salaryMin: 120000,
  salaryMax: 150000,
  salaryCurrency: 'CAD',
  salaryPeriod: 'year',
  applyUrl: 'https://careers.example.com/jobs/1',
  status: 'open',
  contentHash: 'abc',
  postedAt: '2026-10-01T00:00:00.000Z',
  companyId: 'c1',
  companyName: 'Example Co',
  companyDomain: 'example.com',
};

describe('discover track helpers', () => {
  it('maps a posting to tracker form values', () => {
    expect(toTrackValues(posting)).toEqual({
      position: 'Senior Frontend Engineer',
      company: 'Example Co',
      location: 'Toronto, ON',
      status: JobStatus.Pending,
      mode: JobMode.FullTime,
      applyUrl: 'https://careers.example.com/jobs/1',
    });
  });

  it('maps employment types to job modes', () => {
    expect(employmentToJobMode('part_time')).toBe(JobMode.PartTime);
    expect(employmentToJobMode('temporary')).toBe(JobMode.PartTime);
    expect(employmentToJobMode('internship')).toBe(JobMode.Internship);
    expect(employmentToJobMode('full_time')).toBe(JobMode.FullTime);
  });

  it('falls back to country, then Unknown, for short locations', () => {
    expect(resolveTrackLocation(' ', null)).toBe('Unknown');
    expect(resolveTrackLocation('X', 'United States')).toBe('United States');
  });

  it('formats salary ranges in the posting currency', () => {
    expect(formatPostingSalary(posting)).toBe('CA$120,000 – CA$150,000');
    expect(formatPostingSalary({ salaryMin: null, salaryMax: null, salaryCurrency: null })).toBeNull();
    expect(formatPostingSalary({ salaryMin: null, salaryMax: 90000, salaryCurrency: 'USD' })).toBe('Up to $90,000');
  });

  it('builds AI pipeline input with posting fields', () => {
    const input = toPostingPipelineInput(posting);
    expect(input).toMatchObject({
      job_id: 'p1',
      company: 'Example Co',
      posting_status: 'open',
      workplace_type: 'hybrid',
      salary_min: 120000,
      salary_currency: 'CAD',
    });
  });
});

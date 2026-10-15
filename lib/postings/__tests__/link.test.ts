import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  job: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  jobPosting: { findMany: vi.fn(), findUnique: vi.fn() },
}));
const side = vi.hoisted(() => ({
  invalidate: vi.fn(),
  publish: vi.fn(),
  email: vi.fn(),
}));

vi.mock('@/utils/db', () => ({ default: db }));
vi.mock('@/lib/invalidate-jobs-server', () => ({ invalidateUserJobCaches: side.invalidate }));
vi.mock('@/lib/jobs-events', () => ({ publishNotification: side.publish }));
vi.mock('@/lib/notifications/email', () => ({ sendPostingChangeEmail: side.email }));

import {
  buildPostingSnapshot,
  diffSnapshot,
  linkJobToPosting,
  normaliseUrl,
  resyncJob,
  titleSimilarity,
} from '@/lib/postings/link';

const NOW = new Date('2026-10-15T00:00:00.000Z');

function posting(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pst_001',
    status: 'open',
    workplaceType: 'remote',
    salaryMin: 100000,
    salaryMax: 130000,
    salaryCurrency: 'USD',
    contentHash: 'hash-1',
    company: { size: '51-200', industry: 'Software', hq: 'Austin, TX' },
    ...overrides,
  };
}

const stored = {
  postingStatus: 'open',
  postingDescHash: 'hash-1',
  salaryMin: 100000,
  salaryMax: 130000,
  salaryCurrency: 'USD',
};

describe('pure helpers', () => {
  it('normaliseUrl drops protocol, www, query, hash and trailing slash', () => {
    expect(normaliseUrl('https://www.Jobs.Lever.co/acme/123/?utm=x#top')).toBe('jobs.lever.co/acme/123');
  });

  it('titleSimilarity is a Jaccard score over words longer than 2 characters', () => {
    expect(titleSimilarity('Senior Frontend Engineer', 'Frontend Engineer')).toBeCloseTo(2 / 3);
    expect(titleSimilarity('Designer', 'Accountant')).toBe(0);
    expect(titleSimilarity('', '')).toBe(0);
  });

  it('buildPostingSnapshot copies posting and company fields', () => {
    expect(buildPostingSnapshot(posting(), NOW)).toEqual({
      postingId: 'pst_001',
      postingStatus: 'open',
      workplaceType: 'remote',
      salaryMin: 100000,
      salaryMax: 130000,
      salaryCurrency: 'USD',
      postingDescHash: 'hash-1',
      postingSyncedAt: NOW,
      companySize: '51-200',
      companyIndustry: 'Software',
      companyHq: 'Austin, TX',
    });
  });
});

describe('diffSnapshot', () => {
  it('reports no change for an identical snapshot', () => {
    expect(diffSnapshot(stored, buildPostingSnapshot(posting(), NOW))).toEqual({ changeType: null, salaryEdited: false });
  });

  it('prioritises closed over every other change', () => {
    const next = buildPostingSnapshot(posting({ status: 'closed', contentHash: 'hash-2' }), NOW);
    expect(diffSnapshot(stored, next).changeType).toBe('posting_closed');
  });

  it('detects salary added when none was stored', () => {
    const current = { ...stored, salaryMin: null, salaryMax: null, salaryCurrency: null };
    expect(diffSnapshot(current, buildPostingSnapshot(posting(), NOW))).toEqual({
      changeType: 'salary_added',
      salaryEdited: true,
    });
  });

  it('flags JD edits and silent salary edits separately', () => {
    expect(diffSnapshot(stored, buildPostingSnapshot(posting({ contentHash: 'hash-2' }), NOW)).changeType).toBe('jd_changed');
    expect(diffSnapshot(stored, buildPostingSnapshot(posting({ salaryMax: 140000 }), NOW))).toEqual({
      changeType: null,
      salaryEdited: true,
    });
  });
});

describe('linkJobToPosting', () => {
  beforeEach(() => vi.clearAllMocks());

  it('links by exact apply URL and resets change markers', async () => {
    db.job.findUnique.mockResolvedValue({ applyUrl: 'https://jobs.lever.co/acme/1?ref=x', company: 'Acme', position: 'Dev' });
    db.jobPosting.findMany.mockResolvedValueOnce([{ ...posting(), applyUrl: 'https://jobs.lever.co/acme/1' }]);
    db.job.findFirst.mockResolvedValue(null);

    await linkJobToPosting('job-1', 'user-1');

    expect(db.job.update).toHaveBeenCalledWith({
      where: { id: 'job-1', userId: 'user-1' },
      data: expect.objectContaining({ postingId: 'pst_001', postingChangedAt: null, postingChangeType: null }),
    });
    expect(side.invalidate).toHaveBeenCalledWith('user-1', 'job-1');
  });

  it('falls back to same-company title similarity and respects the threshold', async () => {
    db.job.findUnique.mockResolvedValue({ applyUrl: null, company: 'Acme', position: 'Frontend Engineer' });
    db.jobPosting.findMany.mockResolvedValueOnce([
      { ...posting({ id: 'pst_low' }), title: 'Data Analyst' },
      { ...posting({ id: 'pst_best' }), title: 'Senior Frontend Engineer' },
    ]);
    db.job.findFirst.mockResolvedValue(null);

    await linkJobToPosting('job-1', 'user-1');

    expect(db.job.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ postingId: 'pst_best' }) })
    );
  });

  it('leaves the job unlinked when another job already owns the posting', async () => {
    db.job.findUnique.mockResolvedValue({ applyUrl: null, company: 'Acme', position: 'Frontend Engineer' });
    db.jobPosting.findMany.mockResolvedValueOnce([{ ...posting(), title: 'Frontend Engineer' }]);
    db.job.findFirst.mockResolvedValue({ id: 'job-2' });

    await linkJobToPosting('job-1', 'user-1');

    expect(db.job.update).not.toHaveBeenCalled();
  });
});

describe('resyncJob', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stores the change and notifies when a posting closes', async () => {
    db.jobPosting.findUnique.mockResolvedValue(posting({ status: 'closed' }));
    db.job.findUnique.mockResolvedValue({ position: 'Dev', company: 'Acme', ...stored });

    await expect(resyncJob('job-1', 'user-1', 'pst_001')).resolves.toBe(true);

    expect(db.job.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ postingChangeType: 'posting_closed' }) })
    );
    expect(side.publish).toHaveBeenCalledWith('user-1', 'posting_closed', 'job-1', expect.stringContaining('closed'));
    expect(side.email).toHaveBeenCalledWith(expect.objectContaining({ changeType: 'posting_closed' }));
  });

  it('only refreshes the sync time when nothing changed', async () => {
    db.jobPosting.findUnique.mockResolvedValue(posting());
    db.job.findUnique.mockResolvedValue({ position: 'Dev', company: 'Acme', ...stored });

    await expect(resyncJob('job-1', 'user-1', 'pst_001')).resolves.toBe(false);

    expect(db.job.update.mock.calls[0][0].data).not.toHaveProperty('postingChangeType');
    expect(side.invalidate).not.toHaveBeenCalled();
    expect(side.publish).not.toHaveBeenCalled();
  });
});

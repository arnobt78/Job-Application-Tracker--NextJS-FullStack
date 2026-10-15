import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  jobPosting: { findMany: vi.fn(), count: vi.fn(), groupBy: vi.fn() },
}));
vi.mock('@/utils/db', () => ({ default: db }));

import { buildPostingWhere, getPostingFacets, MAX_SEARCH_LIMIT, searchPostings } from '@/lib/postings/queries';
import { postingSearchSchema } from '@/lib/postings/schema';

function row(id: string) {
  return {
    id,
    title: 'Frontend Engineer',
    department: 'Engineering',
    locationText: 'Remote — United States',
    city: null,
    region: null,
    country: 'United States',
    workplaceType: 'remote',
    employmentType: 'full_time',
    salaryMin: 100000,
    salaryMax: 130000,
    salaryCurrency: 'USD',
    salaryPeriod: 'year',
    applyUrl: `https://jobs.example.com/${id}`,
    status: 'open',
    contentHash: 'hash',
    postedAt: new Date('2026-10-01T00:00:00.000Z'),
    company: { id: 'c1', name: 'Northwind Labs', domain: null },
  };
}

describe('buildPostingWhere', () => {
  it('always restricts to open postings and skips unset filters', () => {
    expect(buildPostingWhere({})).toEqual({ status: 'open' });
  });

  it('maps every filter, including text search across title, department and company', () => {
    const where = buildPostingWhere({
      q: '  react ',
      country: 'Canada',
      workplaceType: 'hybrid',
      employmentType: 'contract',
      salaryExists: true,
    });
    expect(where).toMatchObject({
      status: 'open',
      country: 'Canada',
      workplaceType: 'hybrid',
      employmentType: 'contract',
      salaryMax: { not: null },
    });
    expect(where.OR).toEqual([
      { title: { contains: 'react', mode: 'insensitive' } },
      { department: { contains: 'react', mode: 'insensitive' } },
      { company: { name: { contains: 'react', mode: 'insensitive' } } },
    ]);
  });
});

describe('searchPostings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a nextCursor when more rows exist and serialises dates', async () => {
    db.jobPosting.findMany.mockResolvedValue([row('a'), row('b'), row('c')]);
    db.jobPosting.count.mockResolvedValue(7);

    const res = await searchPostings({ limit: 2 });

    expect(db.jobPosting.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3, orderBy: [{ postedAt: 'desc' }, { id: 'desc' }] })
    );
    expect(res.data.map((p) => p.id)).toEqual(['a', 'b']);
    expect(res.meta).toEqual({ total: 7, limit: 2, nextCursor: 'c' });
    expect(res.data[0]).toMatchObject({
      postedAt: '2026-10-01T00:00:00.000Z',
      companyName: 'Northwind Labs',
      description: null,
    });
  });

  it('passes the cursor through and ends pagination on the last page', async () => {
    db.jobPosting.findMany.mockResolvedValue([row('c')]);
    db.jobPosting.count.mockResolvedValue(3);

    const res = await searchPostings({ cursor: 'c', limit: 2 });

    expect(db.jobPosting.findMany).toHaveBeenCalledWith(expect.objectContaining({ cursor: { id: 'c' } }));
    expect(res.meta.nextCursor).toBeNull();
  });

  it('clamps the limit to MAX_SEARCH_LIMIT', async () => {
    db.jobPosting.findMany.mockResolvedValue([]);
    db.jobPosting.count.mockResolvedValue(0);

    await searchPostings({ limit: 500 });

    expect(db.jobPosting.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: MAX_SEARCH_LIMIT + 1 }));
  });
});

describe('getPostingFacets', () => {
  it('maps groupBy counts to facet items', async () => {
    db.jobPosting.groupBy
      .mockResolvedValueOnce([{ workplaceType: 'remote', _count: { _all: 4 } }])
      .mockResolvedValueOnce([{ employmentType: 'full_time', _count: { _all: 9 } }]);

    await expect(getPostingFacets({ country: 'Canada' })).resolves.toEqual({
      workplaceType: [{ value: 'remote', count: 4 }],
      employmentType: [{ value: 'full_time', count: 9 }],
    });
  });
});

describe('postingSearchSchema', () => {
  it('treats empty and "all" filters as unset and coerces query-string values', () => {
    expect(
      postingSearchSchema.parse({ q: '', workplaceType: 'all', salaryExists: 'true', limit: '10' })
    ).toEqual({ q: undefined, workplaceType: undefined, salaryExists: true, limit: 10 });
  });

  it('rejects unknown enum values', () => {
    expect(postingSearchSchema.safeParse({ employmentType: 'gig' }).success).toBe(false);
  });
});

/**
 * Job postings catalog — Prisma reads behind Discover and /api/postings.
 * Uncached; callers go through lib/postings/cache.ts.
 */

import type { Prisma } from '@prisma/client';
import prisma from '@/utils/db';
import type {
  DiscoverFacets,
  DiscoverPosting,
  EmploymentType,
  PostingEvent,
  PostingEventType,
  PostingSearchParams,
  PostingSearchResponse,
  PostingStatus,
  WorkplaceType,
} from '@/lib/postings/types';

export const DEFAULT_SEARCH_LIMIT = 20;
export const MAX_SEARCH_LIMIT = 50;

const LIST_SELECT = {
  id: true,
  title: true,
  department: true,
  locationText: true,
  city: true,
  region: true,
  country: true,
  workplaceType: true,
  employmentType: true,
  salaryMin: true,
  salaryMax: true,
  salaryCurrency: true,
  salaryPeriod: true,
  applyUrl: true,
  status: true,
  contentHash: true,
  postedAt: true,
  company: { select: { id: true, name: true, domain: true } },
} satisfies Prisma.JobPostingSelect;

type ListRow = Prisma.JobPostingGetPayload<{ select: typeof LIST_SELECT }>;

function toDiscoverPosting(row: ListRow, description: string | null = null): DiscoverPosting {
  const { company, postedAt, ...rest } = row;
  return {
    ...rest,
    description,
    workplaceType: rest.workplaceType as WorkplaceType,
    employmentType: rest.employmentType as EmploymentType,
    status: rest.status as PostingStatus,
    postedAt: postedAt.toISOString(),
    companyId: company.id,
    companyName: company.name,
    companyDomain: company.domain,
  };
}

/** Discover lists open postings only; filters mirror the /discover URL params. */
export function buildPostingWhere(
  params: Omit<PostingSearchParams, 'cursor' | 'limit'>
): Prisma.JobPostingWhereInput {
  const q = params.q?.trim();
  return {
    status: 'open',
    ...(params.country ? { country: params.country } : {}),
    ...(params.workplaceType ? { workplaceType: params.workplaceType } : {}),
    ...(params.employmentType ? { employmentType: params.employmentType } : {}),
    ...(params.salaryExists ? { salaryMax: { not: null } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
            { company: { name: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };
}

/** Newest-first keyset pagination; `nextCursor` is the id of the first row of the next page. */
export async function searchPostings(
  params: PostingSearchParams
): Promise<PostingSearchResponse> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_SEARCH_LIMIT, 1), MAX_SEARCH_LIMIT);
  const where = buildPostingWhere(params);

  const [rows, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      select: LIST_SELECT,
      orderBy: [{ postedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor } } : {}),
    }),
    prisma.jobPosting.count({ where }),
  ]);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    data: page.map((row) => toDiscoverPosting(row)),
    meta: { total, limit, nextCursor: hasMore ? rows[limit].id : null },
  };
}

/** Facet counts honour the text + country filters so dropdown numbers match the result list. */
export async function getPostingFacets(params: {
  q?: string;
  country?: string;
}): Promise<DiscoverFacets> {
  const where = buildPostingWhere(params);
  const [workplace, employment] = await Promise.all([
    prisma.jobPosting.groupBy({ by: ['workplaceType'], where, _count: { _all: true } }),
    prisma.jobPosting.groupBy({ by: ['employmentType'], where, _count: { _all: true } }),
  ]);

  return {
    workplaceType: workplace.map((f) => ({ value: f.workplaceType, count: f._count._all })),
    employmentType: employment.map((f) => ({ value: f.employmentType, count: f._count._all })),
  };
}

/** Full posting including description — open or closed, so tracked jobs can still show it. */
export async function getPostingDetail(id: string): Promise<DiscoverPosting | null> {
  const row = await prisma.jobPosting.findUnique({
    where: { id },
    select: { ...LIST_SELECT, description: true },
  });
  if (!row) return null;
  const { description, ...listRow } = row;
  return toDiscoverPosting(listRow, description);
}

export async function getPostingEvents(postingId: string, limit = 20): Promise<PostingEvent[]> {
  const rows = await prisma.jobPostingEvent.findMany({
    where: { postingId },
    orderBy: { observedAt: 'desc' },
    take: limit,
  });
  return rows.map((e) => ({
    id: e.id,
    type: e.type as PostingEventType,
    fieldName: e.fieldName,
    oldValue: e.oldValue,
    newValue: e.newValue,
    observedAt: e.observedAt.toISOString(),
  }));
}

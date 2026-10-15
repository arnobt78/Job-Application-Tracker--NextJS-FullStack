/**
 * Discover query options — shared by SSR prefetch (page.tsx) and client hooks.
 * Must live outside 'use client' modules so the server can call these builders.
 */
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getPostingFacetsAction, searchPostingsAction } from '@/utils/actions';
import type { PostingSearchResponse } from '@/lib/postings/types';

export const DEFAULT_DISCOVER_COUNTRY = 'United States';

export function buildDiscoverQueryOptions(
  q: string,
  country: string,
  workplaceType: string,
  employmentType: string,
  salaryExists: boolean
) {
  return infiniteQueryOptions({
    queryKey: queryKeys.discover.search(q, country, workplaceType, employmentType, salaryExists),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      searchPostingsAction({
        q,
        country,
        workplaceType,
        employmentType,
        salaryExists,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage: PostingSearchResponse) => lastPage.meta.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 60_000,
    // Keep prior pages visible while filters refetch (no grid flash)
    placeholderData: (prev) => prev,
  });
}

export function buildDiscoverFacetsOptions(q: string, country: string) {
  return queryOptions({
    queryKey: queryKeys.discover.facets(q, country),
    queryFn: () => getPostingFacetsAction({ q, country }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

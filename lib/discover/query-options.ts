/**
 * Discover infinite-query options — shared by SSR prefetch (page.tsx) and client hooks.
 * Must live outside 'use client' modules so the server can call buildDiscoverQueryOptions.
 */
import { infiniteQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { searchBluedoorJobsAction } from '@/utils/actions';
import type { BluedoorSearchResponse } from '@/lib/bluedoor/types';

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
      searchBluedoorJobsAction({
        q,
        country,
        workplaceType,
        employmentType,
        salaryExists: salaryExists || undefined,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage: BluedoorSearchResponse) =>
      lastPage.meta.next_cursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 60_000,
    // Keep prior pages visible while filters refetch (no grid flash)
    placeholderData: (prev) => prev,
  });
}

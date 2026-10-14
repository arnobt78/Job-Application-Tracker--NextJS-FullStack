'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAllJobsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { parseJobsListFilters } from '@/lib/jobs/filter-params';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';

/** Shared jobs list query for dashboard count, pagination, and grid */
export function useJobsListQuery() {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseJobsListFilters(searchParams),
    [searchParams]
  );
  const isRouteFallback = useIsRouteFallback();

  return useQuery({
    enabled: !isRouteFallback,
    queryKey: queryKeys.jobs.list(
      filters.search,
      filters.jobStatus,
      filters.jobMode,
      filters.monthYear,
      filters.page
    ),
    queryFn: () =>
      getAllJobsAction({
        search: filters.search,
        jobStatus: filters.jobStatus,
        jobMode: filters.jobMode,
        monthYear: filters.monthYear,
        page: filters.page,
      }),
    placeholderData: keepPreviousData,
    // staleTime:0 + refetchOnMount:always ensures the SSR hydrated state is always refetched
    // on dashboard mount, so a stale HydrationBoundary snapshot is overwritten by fresh DB data
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

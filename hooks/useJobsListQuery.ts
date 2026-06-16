'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAllJobsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { parseJobsListFilters } from '@/lib/jobs/filter-params';

/** Shared jobs list query for dashboard count, pagination, and grid */
export function useJobsListQuery() {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseJobsListFilters(searchParams),
    [searchParams]
  );

  return useQuery({
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
  });
}

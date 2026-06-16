'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJobsListQuery } from '@/hooks/useJobsListQuery';
import { parseJobsListFilters } from '@/lib/jobs/filter-params';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { queryKeys } from '@/lib/query-keys';

/** Jobs list query + cache-aware body loading for dashboard grid/toolbar/pagination. */
export function useJobsListBodyLoading() {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseJobsListFilters(searchParams),
    [searchParams]
  );
  const queryKey = queryKeys.jobs.list(
    filters.search,
    filters.jobStatus,
    filters.jobMode,
    filters.monthYear,
    filters.page
  );
  const query = useJobsListQuery();
  const bodyLoading = useQueryBodyLoading(queryKey, query.isLoading);

  return { ...query, bodyLoading, queryKey };
}

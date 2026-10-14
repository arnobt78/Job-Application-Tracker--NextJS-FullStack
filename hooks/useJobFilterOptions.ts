'use client';

import { useQuery } from '@tanstack/react-query';
import { getJobFilterOptionsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';

/** Cached month options for dashboard filters (only months with job data) */
export function useJobFilterOptions() {
  const isRouteFallback = useIsRouteFallback();
  return useQuery({
    queryKey: queryKeys.jobs.filterOptions,
    queryFn: () => getJobFilterOptionsAction(),
    staleTime: 60_000,
    enabled: !isRouteFallback,
  });
}

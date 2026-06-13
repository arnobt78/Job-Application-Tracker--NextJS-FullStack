'use client';

import { useQuery } from '@tanstack/react-query';
import { getJobFilterOptionsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';

/** Cached month options for dashboard filters (only months with job data) */
export function useJobFilterOptions() {
  return useQuery({
    queryKey: queryKeys.jobs.filterOptions,
    queryFn: () => getJobFilterOptionsAction(),
  });
}

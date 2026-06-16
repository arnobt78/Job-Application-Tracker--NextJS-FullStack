'use client';

import { useQuery } from '@tanstack/react-query';
import { getStatsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';

/** Global portfolio stats (status + mode breakdown) — shared with stats page cache */
export function useJobsPortfolioStats() {
  return useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
  });
}

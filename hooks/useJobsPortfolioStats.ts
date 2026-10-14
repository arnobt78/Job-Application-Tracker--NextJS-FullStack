'use client';

import { useQuery } from '@tanstack/react-query';
import { getStatsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';

/** Global portfolio stats (status + mode breakdown) — shared with stats page cache */
export function useJobsPortfolioStats() {
  const isRouteFallback = useIsRouteFallback();
  return useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
    staleTime: 60_000,
    enabled: !isRouteFallback,
  });
}

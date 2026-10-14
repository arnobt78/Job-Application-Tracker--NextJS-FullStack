'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getBluedoorFacetsAction } from '@/utils/actions';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';

/** Live Bluedoor facet counts for Discover filters — staleTime 5 min, NOT persisted, graceful empty on error */
export function useDiscoverFacets(q: string, country: string) {
  const isRouteFallback = useIsRouteFallback();
  return useQuery({
    queryKey: queryKeys.discover.facets(
      q || undefined,
      country !== 'United States' ? country : undefined
    ),
    queryFn: () => getBluedoorFacetsAction({ q: q || undefined, country }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !isRouteFallback,
  });
}

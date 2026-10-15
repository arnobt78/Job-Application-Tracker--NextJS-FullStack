'use client';

import { useQuery } from '@tanstack/react-query';
import { buildDiscoverFacetsOptions } from '@/lib/discover/query-options';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';

/** Facet counts for Discover filters — staleTime 5 min, NOT persisted, graceful empty on error */
export function useDiscoverFacets(q: string, country: string) {
  const isRouteFallback = useIsRouteFallback();
  return useQuery({
    ...buildDiscoverFacetsOptions(q, country),
    enabled: !isRouteFallback,
  });
}

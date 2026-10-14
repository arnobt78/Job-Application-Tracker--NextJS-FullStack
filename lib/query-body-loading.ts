'use client';

import {
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';

/**
 * True when loading and SSR/hydration/cache has not seeded data yet.
 * Uses `data !== undefined` so empty arrays from SSR still count as warm cache.
 */
export function getQueryBodyLoadingState(
  queryClient: QueryClient,
  queryKey: QueryKey,
  isLoading: boolean
): boolean {
  const hasCache = queryClient.getQueryState(queryKey)?.data !== undefined;
  return isLoading && !hasCache;
}

/**
 * Skeleton only on cold load — skip when HydrationBoundary or keepPreviousData warmed the cache.
 * Inside a route loading fallback the query is disabled (never "loading"), so a cold cache counts as loading.
 */
export function useQueryBodyLoading(
  queryKey: QueryKey,
  isLoading: boolean
): boolean {
  const queryClient = useQueryClient();
  const isRouteFallback = useIsRouteFallback();
  return getQueryBodyLoadingState(queryClient, queryKey, isLoading || isRouteFallback);
}

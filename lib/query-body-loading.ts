'use client';

import {
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';

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

/** Skeleton only on cold load — skip when HydrationBoundary or keepPreviousData warmed the cache. */
export function useQueryBodyLoading(
  queryKey: QueryKey,
  isLoading: boolean
): boolean {
  const queryClient = useQueryClient();
  return getQueryBodyLoadingState(queryClient, queryKey, isLoading);
}

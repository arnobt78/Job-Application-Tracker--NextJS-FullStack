/**
 * Server-side cache for Bluedoor discover API calls.
 * Prevents 429 rate-limit hits when force-dynamic SSR re-runs on every navigation/HMR.
 * Uses Next.js unstable_cache (in-memory/file, NOT Redis or localStorage).
 *
 * Key fix: 429 errors are caught INSIDE the cached function and converted to empty results.
 * This means the empty result gets cached and dehydrated into HydrationBoundary, which gives
 * the client a valid dataUpdatedAt so staleTime:60_000 prevents client re-fetches during cooldown.
 * Without this, uncaught throws skip the cache → SSR retries Bluedoor on every render → 429 loop.
 */

import { unstable_cache } from 'next/cache';
import { BluedoorApiError, searchJobs, getDiscoverFacets } from '@/lib/bluedoor/client';
import type { BluedoorSearchResponse, DiscoverFacets } from '@/lib/bluedoor/types';

type SearchParams = {
  q?: string;
  country?: string;
  workplace_type?: 'remote' | 'hybrid' | 'on_site';
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';
  salary_exists?: boolean;
  cursor?: string;
  limit?: number;
};

/** Empty Bluedoor response for 429/timeout — cached so SSR doesn't retry until TTL expires. */
function rateLimitedResponse(limit: number): BluedoorSearchResponse {
  return { data: [], meta: { limit, order: '', total_matching_unavailable: true } };
}

/**
 * Cached Bluedoor search — 60s TTL per unique query+filter+cursor combination.
 * 429 and timeout errors return an empty cached result so the client
 * receives a valid HydrationBoundary snapshot and staleTime:60_000 prevents retries.
 */
export async function getCachedDiscoverSearch(
  params: SearchParams
): Promise<BluedoorSearchResponse> {
  const limit = params.limit ?? 20;
  const cacheKey = [
    'bluedoor',
    'search',
    params.q ?? '',
    params.country ?? '',
    params.workplace_type ?? '',
    params.employment_type ?? '',
    String(params.salary_exists ?? false),
    params.cursor ?? '',
    String(limit),
  ];

  return unstable_cache(
    async () => {
      try {
        return await searchJobs(params);
      } catch (err) {
        // Cache rate-limit + timeout responses so SSR stops retrying until TTL expires.
        // Other errors re-throw so they are NOT cached (transient failures should retry).
        if (
          (err instanceof BluedoorApiError && err.status === 429) ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          return rateLimitedResponse(limit);
        }
        throw err;
      }
    },
    cacheKey,
    { revalidate: 60 }
  )();
}

/**
 * Cached Bluedoor facet counts — 300s TTL (facets change slowly).
 * 429 returns empty facets (cached) so the filter dropdowns still render without crashing.
 */
export async function getCachedDiscoverFacets(
  params: { q?: string; country?: string }
): Promise<DiscoverFacets> {
  const cacheKey = [
    'bluedoor',
    'facets',
    params.q ?? '',
    params.country ?? '',
  ];

  return unstable_cache(
    async () => {
      try {
        return await getDiscoverFacets(params);
      } catch (err) {
        if (err instanceof BluedoorApiError && err.status === 429) {
          return { workplace_type: [], employment_type: [] };
        }
        throw err;
      }
    },
    cacheKey,
    { revalidate: 300 }
  )();
}

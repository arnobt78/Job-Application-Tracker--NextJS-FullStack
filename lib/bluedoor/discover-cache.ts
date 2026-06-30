/**
 * Server-side cache for Bluedoor discover API calls.
 * Prevents 429 rate-limit hits when force-dynamic SSR re-runs on every navigation/HMR.
 * Uses Next.js unstable_cache (in-memory/file, NOT Redis or localStorage).
 * Not subject to the "do not persist discover" rule — TTL-based expiry only, not persisted.
 */

import { unstable_cache } from 'next/cache';
import { searchJobs, getDiscoverFacets } from '@/lib/bluedoor/client';
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

/**
 * Cached Bluedoor search — 60s TTL per unique query+filter+cursor combination.
 * Shared across all authenticated users for identical params (search results are public).
 */
export async function getCachedDiscoverSearch(
  params: SearchParams
): Promise<BluedoorSearchResponse> {
  const cacheKey = [
    'bluedoor',
    'search',
    params.q ?? '',
    params.country ?? '',
    params.workplace_type ?? '',
    params.employment_type ?? '',
    String(params.salary_exists ?? false),
    params.cursor ?? '',
    String(params.limit ?? 20),
  ];

  return unstable_cache(
    () => searchJobs(params),
    cacheKey,
    { revalidate: 60 }
  )();
}

/**
 * Cached Bluedoor facet counts — 300s TTL (facets change slowly).
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
    () => getDiscoverFacets(params),
    cacheKey,
    { revalidate: 300 }
  )();
}

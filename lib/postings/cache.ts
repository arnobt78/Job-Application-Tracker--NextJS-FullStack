/**
 * Cached postings reads for Discover SSR, server actions and /api/postings.
 * The catalog changes only on seed/admin writes, which call revalidateTag(POSTINGS_TAG).
 */

import { unstable_cache } from 'next/cache';
import {
  getPostingDetail,
  getPostingEvents,
  getPostingFacets,
  searchPostings,
} from '@/lib/postings/queries';
import type {
  DiscoverFacets,
  DiscoverPosting,
  PostingEvent,
  PostingSearchParams,
  PostingSearchResponse,
} from '@/lib/postings/types';

export const POSTINGS_TAG = 'postings';
const REVALIDATE_SECONDS = 300;

export function getCachedPostingSearch(
  params: PostingSearchParams
): Promise<PostingSearchResponse> {
  return unstable_cache(() => searchPostings(params), ['postings', 'search', JSON.stringify(params)], {
    revalidate: REVALIDATE_SECONDS,
    tags: [POSTINGS_TAG],
  })();
}

export function getCachedPostingFacets(params: {
  q?: string;
  country?: string;
}): Promise<DiscoverFacets> {
  return unstable_cache(() => getPostingFacets(params), ['postings', 'facets', params.q ?? '', params.country ?? ''], {
    revalidate: REVALIDATE_SECONDS,
    tags: [POSTINGS_TAG],
  })();
}

export function getCachedPostingDetail(id: string): Promise<DiscoverPosting | null> {
  return unstable_cache(() => getPostingDetail(id), ['postings', 'detail', id], {
    revalidate: REVALIDATE_SECONDS,
    tags: [POSTINGS_TAG],
  })();
}

export function getCachedPostingEvents(postingId: string): Promise<PostingEvent[]> {
  return unstable_cache(() => getPostingEvents(postingId), ['postings', 'events', postingId], {
    revalidate: REVALIDATE_SECONDS,
    tags: [POSTINGS_TAG],
  })();
}

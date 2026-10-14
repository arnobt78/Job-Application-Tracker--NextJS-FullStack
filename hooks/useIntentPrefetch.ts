'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Prefetch a route's loading shell on user intent (hover / focus / touch) instead of on viewport entry.
 * Pair with `<Link prefetch={false}>`: only links the user is about to click cost a request,
 * and the router cache dedupes repeat calls for the same href.
 */
export function useIntentPrefetch(href: string): () => void {
  const router = useRouter();
  return useCallback(() => router.prefetch(href), [router, href]);
}

import { QueryClient } from '@tanstack/react-query';

/** localStorage key for persisted React Query cache */
export const PERSIST_CACHE_KEY = 'jobify-query-cache';

/** Bump when shipping breaking cache shape — forces clients to drop stale persist */
export const PERSIST_BUSTER = 'v2';

/** Default QueryClient — mutations still invalidate explicitly after CRUD */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
      },
    },
  });
}

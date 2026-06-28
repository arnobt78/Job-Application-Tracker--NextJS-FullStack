import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Persister } from '@tanstack/react-query-persist-client';
import type { Query } from '@tanstack/react-query';
import { PERSIST_CACHE_KEY } from '@/lib/query-client';

/**
 * Persist only job/stats/chart queries — not auth or ephemeral keys.
 * Restored cache + useQueryBodyLoading skips skeleton on hard refresh.
 */
export function shouldPersistQuery(query: Query): boolean {
  const root = query.queryKey[0];
  if (root === 'jobs' || root === 'stats' || root === 'charts' || root === 'charts-weekly' || root === 'job') {
    return true;
  }
  return false;
}

/** No-op persister for SSR / first client frame — avoids hydration mismatch */
export const noopPersister: Persister = {
  persistClient: async () => {},
  restoreClient: async () => undefined,
  removeClient: async () => {},
};

/** Browser localStorage persister — null when unavailable (private mode, SSR) */
export function buildLocalStoragePersister(): Persister | null {
  if (typeof window === 'undefined') return null;
  try {
    return createAsyncStoragePersister({
      storage: window.localStorage,
      key: PERSIST_CACHE_KEY,
      throttleTime: 1_000,
    });
  } catch {
    return null;
  }
}

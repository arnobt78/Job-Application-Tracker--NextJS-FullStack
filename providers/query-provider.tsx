'use client';

import { useEffect, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { Persister } from '@tanstack/react-query-persist-client';
import { AuthToastListener } from '@/components/auth/auth-toast-listener';
import { useJobsCacheSync } from '@/hooks/useJobsCacheSync';
import { useSentryUser } from '@/hooks/useSentryUser';
import {
  createQueryClient,
  PERSIST_BUSTER,
} from '@/lib/query-client';
import {
  buildLocalStoragePersister,
  noopPersister,
  shouldPersistQuery,
} from '@/lib/query-persist';

function AuthToastSyncListener() {
  return <AuthToastListener />;
}

function JobsCacheSyncListener() {
  useJobsCacheSync();
  return null;
}

function SentryUserListener() {
  useSentryUser();
  return null;
}

/**
 * TanStack Query + localStorage persistence.
 * noop persister on SSR/first frame → real persister after mount (hydration-safe).
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  const [persister, setPersister] = useState<Persister>(noopPersister);

  // Attach localStorage persister after hydration (noop on SSR/first frame)
  useEffect(() => {
    const real = buildLocalStoragePersister();
    if (real) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- calendar-proven persist attach
      setPersister(real);
    }
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1_000,
        buster: PERSIST_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            shouldPersistQuery(query) && query.state.status === 'success',
        },
      }}
    >
      <JobsCacheSyncListener />
      <AuthToastSyncListener />
      <SentryUserListener />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

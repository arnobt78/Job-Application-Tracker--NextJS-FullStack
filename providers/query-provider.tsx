'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthToastListener } from '@/components/auth/auth-toast-listener';
import { useJobsCacheSync } from '@/hooks/useJobsCacheSync';
import { useSentryUser } from '@/hooks/useSentryUser';

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

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Dashboard data refetches immediately after mutations via invalidation
        staleTime: 0,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <JobsCacheSyncListener />
      <AuthToastSyncListener />
      <SentryUserListener />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

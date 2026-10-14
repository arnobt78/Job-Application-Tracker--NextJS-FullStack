'use client';

/**
 * RouteFallbackProvider — wraps a page view inside its route `loading.tsx`.
 *
 * The fallback renders the exact same view as `page.tsx`, so navigation paints the real layout
 * instantly. Inside it, data queries are disabled (`enabled: !isRouteFallback`): warm cache shows
 * real data, cold cache shows each component's own skeleton, and no request is sent — the page's
 * awaited server prefetch is the single fetch.
 *
 * The fallback reads a snapshot client, never the app QueryClient: a disabled query would leave an
 * empty entry in the app cache, and HydrationBoundary defers hydrating existing entries until after
 * its children mount — they would see no data and fire a duplicate client fetch.
 *
 * The fallback is `inert`: forms and mutations there would write to the throwaway snapshot and
 * typed input would vanish when the page swaps in. `contents` keeps the wrapper out of layout.
 */

import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import {
  dehydrate,
  hydrate,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

const RouteFallbackContext = createContext(false);

export function RouteFallbackProvider({ children }: PropsWithChildren) {
  const appClient = useQueryClient();
  const [snapshotClient] = useState(() => {
    const client = new QueryClient({ defaultOptions: appClient.getDefaultOptions() });
    hydrate(client, dehydrate(appClient));
    return client;
  });

  return (
    <QueryClientProvider client={snapshotClient}>
      <RouteFallbackContext.Provider value={true}>
        <div inert className="contents">
          {children}
        </div>
      </RouteFallbackContext.Provider>
    </QueryClientProvider>
  );
}

/** True inside a route loading fallback — pass `enabled: !isRouteFallback` to data queries. */
export function useIsRouteFallback(): boolean {
  return useContext(RouteFallbackContext);
}

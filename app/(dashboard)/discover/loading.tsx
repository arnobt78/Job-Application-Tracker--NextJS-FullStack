import { RouteFallbackProvider } from '@/components/providers/route-fallback-provider';
import { DiscoverPageView } from '@/components/discover/discover-page-view';

/** Instant navigation shell — same view as page.tsx; queries read cache only until the server payload streams in */
export default function DiscoverLoading() {
  return (
    <RouteFallbackProvider>
      <DiscoverPageView />
    </RouteFallbackProvider>
  );
}

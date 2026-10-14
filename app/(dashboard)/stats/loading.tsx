import { RouteFallbackProvider } from '@/components/providers/route-fallback-provider';
import { StatsPageView } from '@/components/stats/stats-page-view';

/** Instant navigation shell — same view as page.tsx; queries read cache only until the server payload streams in */
export default function StatsLoading() {
  return (
    <RouteFallbackProvider>
      <StatsPageView />
    </RouteFallbackProvider>
  );
}

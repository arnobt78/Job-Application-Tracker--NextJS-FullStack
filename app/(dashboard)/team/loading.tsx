import { RouteFallbackProvider } from '@/components/providers/route-fallback-provider';
import { TeamPageView } from '@/components/team/team-page-view';

/** Instant navigation shell — same view as page.tsx; queries read cache only until the server payload streams in */
export default function TeamLoading() {
  return (
    <RouteFallbackProvider>
      <TeamPageView />
    </RouteFallbackProvider>
  );
}

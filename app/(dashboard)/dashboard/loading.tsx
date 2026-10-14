import { RouteFallbackProvider } from '@/components/providers/route-fallback-provider';
import { DashboardPageView } from '@/components/jobs/dashboard-page-view';

/** Instant navigation shell — same view as page.tsx; queries read cache only until the server payload streams in */
export default function DashboardLoading() {
  return (
    <RouteFallbackProvider>
      <DashboardPageView />
    </RouteFallbackProvider>
  );
}

import { RouteFallbackProvider } from '@/components/providers/route-fallback-provider';
import { TimelinePageView } from '@/components/timeline/timeline-page-view';

/** Instant navigation shell — same view as page.tsx; queries read cache only until the server payload streams in */
export default function TimelineLoading() {
  return (
    <RouteFallbackProvider>
      <TimelinePageView />
    </RouteFallbackProvider>
  );
}

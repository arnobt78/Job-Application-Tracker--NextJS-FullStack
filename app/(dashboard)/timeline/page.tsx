import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import { getTimelineAction } from '@/utils/actions';
import { TimelinePageView } from '@/components/timeline/timeline-page-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Activity Timeline',
  description: 'Chronological feed of all job application activity — created, enriched, posting changes, and AI insights.',
  path: '/timeline',
  noIndex: true,
});

/** Global activity timeline — SSR-prefetches events for instant first render. */
async function TimelinePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.timeline(),
    queryFn: () => getTimelineAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TimelinePageView />
    </HydrationBoundary>
  );
}

export default TimelinePage;

import ChartsContainer from '@/components/ChartsContainer';
import StatsContainer from '@/components/StatsContainer';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import { getChartsDataAction, getStatsAction } from '@/utils/actions';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Statistics',
  description:
    'Analyze your job search with pending, interview, and declined counts plus application trends over the last six months.',
  path: '/stats',
  noIndex: true,
});

async function StatsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
  });
  await queryClient.prefetchQuery({
    queryKey: queryKeys.charts.all,
    queryFn: () => getChartsDataAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StatsContainer />
      <ChartsContainer />
    </HydrationBoundary>
  );
}

export default StatsPage;

import { StatsPageView } from '@/components/stats/stats-page-view';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import {
  getChartsDataAction,
  getStatsAction,
  getWeeklyChartsDataAction,
  getSalaryIntelligenceAction,
} from '@/utils/actions';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Statistics',
  description:
    'Analyze your job applications with trends, velocity charts, status breakdown, and response rate KPIs.',
  path: '/stats',
  noIndex: true,
});

async function StatsPage() {
  const queryClient = new QueryClient();

  // SSR prefetch all stats + charts + salary data in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.stats.all,
      queryFn: () => getStatsAction(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.charts.all,
      queryFn: () => getChartsDataAction(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.chartsWeekly.all,
      queryFn: () => getWeeklyChartsDataAction(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.salaryIntel(),
      queryFn: () => getSalaryIntelligenceAction(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StatsPageView />
    </HydrationBoundary>
  );
}

export default StatsPage;

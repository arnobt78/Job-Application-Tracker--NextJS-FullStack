import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { DiscoverPageView } from '@/components/discover/discover-page-view';
import { buildDiscoverQueryOptions } from '@/lib/discover/query-options';
import { queryKeys } from '@/lib/query-keys';
import { getBluedoorFacetsAction } from '@/utils/actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Discover Jobs',
  description:
    'Search 1.8M+ live job postings from Greenhouse, Lever, Ashby, Workday and more. One click to track any posting in your application pipeline.',
  path: '/discover',
  noIndex: true,
});

type DiscoverPageProps = {
  searchParams: Promise<{
    q?: string;
    country?: string;
    workplaceType?: string;
    employmentType?: string;
    salaryExists?: string;
  }>;
};

async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;

  const q = params.q ?? '';
  const country = params.country ?? 'United States';
  const workplaceType = params.workplaceType ?? '';
  const employmentType = params.employmentType ?? '';
  const salaryExists = params.salaryExists === 'yes';

  const queryClient = new QueryClient();

  // SSR prefetch — must not throw; Bluedoor/auth slowness degrades to client fetch.
  try {
    await Promise.all([
      queryClient.prefetchInfiniteQuery(
        buildDiscoverQueryOptions(q, country, workplaceType, employmentType, salaryExists)
      ),
      queryClient.prefetchQuery({
        queryKey: queryKeys.discover.facets(q || undefined, country !== 'United States' ? country : undefined),
        queryFn: () => getBluedoorFacetsAction({ q: q || undefined, country }),
      }),
    ]);
  } catch (error) {
    console.error('[DiscoverPage] SSR prefetch failed:', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiscoverPageView />
    </HydrationBoundary>
  );
}

export default DiscoverPage;

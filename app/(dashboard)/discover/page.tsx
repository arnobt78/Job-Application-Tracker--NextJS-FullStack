import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { DiscoverPageView } from '@/components/discover/discover-page-view';
import {
  buildDiscoverFacetsOptions,
  buildDiscoverQueryOptions,
  DEFAULT_DISCOVER_COUNTRY,
} from '@/lib/discover/query-options';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Discover Jobs',
  description:
    'Browse open job postings across engineering, design, product and data roles. One click to track any posting in your application pipeline.',
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
  const country = params.country ?? DEFAULT_DISCOVER_COUNTRY;
  const workplaceType = params.workplaceType ?? '';
  const employmentType = params.employmentType ?? '';
  const salaryExists = params.salaryExists === 'yes';

  const queryClient = new QueryClient();

  // SSR prefetch — must not throw; DB/auth slowness degrades to client fetch.
  try {
    await Promise.all([
      queryClient.prefetchInfiniteQuery(
        buildDiscoverQueryOptions(q, country, workplaceType, employmentType, salaryExists)
      ),
      queryClient.prefetchQuery(buildDiscoverFacetsOptions(q, country)),
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

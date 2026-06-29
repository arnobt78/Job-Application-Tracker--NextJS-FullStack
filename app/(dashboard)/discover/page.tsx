import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { DiscoverPageHeader } from '@/components/discover/discover-page-header';
import { DiscoverFilterSection } from '@/components/discover/discover-filter-section';
import { DiscoverSidebar } from '@/components/discover/discover-sidebar';
import { DiscoverResultsToolbar } from '@/components/discover/discover-results-toolbar';
import { DiscoverResults, DiscoverCardShellGrid } from '@/components/discover/discover-results';
import { buildDiscoverQueryOptions } from '@/lib/discover/query-options';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { SlidersHorizontal } from 'lucide-react';
import { Suspense } from 'react';
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
      {/* h1 header — static, never inside Suspense */}
      <DiscoverPageHeader />

      {/* Two-panel layout: sidebar (lg+) on left, results column on right */}
      <div className="flex gap-6">
        {/* Left sidebar — sticky, desktop only; uses useSearchParams so needs Suspense */}
        <Suspense>
          <DiscoverSidebar className="hidden w-60 shrink-0 lg:block xl:w-64" />
        </Suspense>

        {/* Results column — full width on mobile, flex-1 on desktop */}
        <div className="min-w-0 flex-1">
          {/* Mobile-only filter section — hidden on lg+ (sidebar handles it) */}
          <PageSectionHeader
            icon={SlidersHorizontal}
            title="Search & Filter"
            className="mb-2 lg:hidden"
          />
          {/* DiscoverFilterSection uses useSearchParams — needs Suspense */}
          <Suspense>
            <DiscoverFilterSection />
          </Suspense>

          {/* Results toolbar + grid — both use useSearchParams, share Suspense boundary */}
          <Suspense fallback={<DiscoverCardShellGrid />}>
            <DiscoverResultsToolbar />
            <DiscoverResults />
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  );
}

export default DiscoverPage;

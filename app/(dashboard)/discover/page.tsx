import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { DiscoverPageHeader } from '@/components/discover/discover-page-header';
import { DiscoverFilterSection } from '@/components/discover/discover-filter-section';
import { DiscoverResultsToolbar } from '@/components/discover/discover-results-toolbar';
import {
  DiscoverResults,
  DiscoverCardShellGrid,
  buildDiscoverQueryOptions,
} from '@/components/discover/discover-results';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { SlidersHorizontal } from 'lucide-react';
import { Suspense } from 'react';

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

  // SSR prefetch first page — hydrates infinite query so DiscoverResults renders immediately.
  // buildDiscoverQueryOptions keeps page.tsx + DiscoverResults on the same query options.
  await queryClient.prefetchInfiniteQuery(
    buildDiscoverQueryOptions(q, country, workplaceType, employmentType, salaryExists)
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* h1 header — static, never inside Suspense */}
      <DiscoverPageHeader />

      {/* Filter section header — static, never inside Suspense to avoid visual expansion */}
      <PageSectionHeader
        icon={SlidersHorizontal}
        title="Search & Filter"
        className="mb-2"
      />

      {/* DiscoverFilterSection uses useSearchParams — needs Suspense */}
      <Suspense>
        <DiscoverFilterSection />
      </Suspense>

      {/* Results toolbar + grid — both use useSearchParams, share same Suspense boundary */}
      <Suspense fallback={<DiscoverCardShellGrid />}>
        <DiscoverResultsToolbar />
        <DiscoverResults />
      </Suspense>
    </HydrationBoundary>
  );
}

export default DiscoverPage;

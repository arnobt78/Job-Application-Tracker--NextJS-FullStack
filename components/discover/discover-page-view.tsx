import { Suspense } from 'react';
import { DiscoverPageHeader } from '@/components/discover/discover-page-header';
import { DiscoverFilterSection } from '@/components/discover/discover-filter-section';
import { DiscoverSidebar } from '@/components/discover/discover-sidebar';
import { DiscoverResultsToolbar } from '@/components/discover/discover-results-toolbar';
import { DiscoverResults } from '@/components/discover/discover-results';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { SlidersHorizontal } from 'lucide-react';

/** /discover layout — rendered by page.tsx (hydrated) and loading.tsx (instant shell, cache-only queries) */
export function DiscoverPageView() {
  return (
    <>
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
          <Suspense fallback={null}>
            <DiscoverResultsToolbar />
            <DiscoverResults />
          </Suspense>
        </div>
      </div>
    </>
  );
}

import { JobsFilterSection } from '@/components/jobs/jobs-filter-section';
import { DashboardPageHeader } from '@/components/jobs/dashboard-page-header';
import { JobsResultsToolbar } from '@/components/jobs/jobs-results-toolbar';
import { JobsGrid } from '@/components/jobs/jobs-grid';
import { JobsPagination } from '@/components/jobs/jobs-pagination';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { DASHBOARD_COPY } from '@/lib/ui/dashboard-copy';
import { SlidersHorizontal } from 'lucide-react';

/** /dashboard layout — rendered by page.tsx (hydrated) and loading.tsx (instant shell, cache-only queries) */
export function DashboardPageView() {
  const filterCopy = DASHBOARD_COPY.filters;

  return (
    <>
      <DashboardPageHeader />

      <PageSectionHeader
        icon={SlidersHorizontal}
        title={filterCopy.title}
        className="mb-2"
      />
      <JobsFilterSection />

      <JobsResultsToolbar />

      <JobsGrid />

      <div className="mt-8 flex w-full justify-center">
        <JobsPagination />
      </div>
    </>
  );
}

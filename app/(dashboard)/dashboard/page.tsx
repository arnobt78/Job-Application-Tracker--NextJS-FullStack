import { JobsFilterBar } from "@/components/jobs/jobs-filter-bar";
import { DashboardPageHeader } from "@/components/jobs/dashboard-page-header";
import { JobsResultsToolbar } from "@/components/jobs/jobs-results-toolbar";
import { JobsGrid } from "@/components/jobs/jobs-grid";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { PageSectionHeader } from "@/components/ui/page-section-header";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";
import { queryKeys } from "@/lib/query-keys";
import { DASHBOARD_COPY } from "@/lib/ui/dashboard-copy";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  getAllJobsAction,
  getJobFilterOptionsAction,
  getStatsAction,
} from "@/utils/actions";
import { parseJobsListFiltersFromSearchParamsRecord } from "@/lib/jobs/filter-params";
import { SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description:
    "View, search, and filter all your job applications. Add new applications and track your progress.",
  path: "/dashboard",
  noIndex: true,
});

type DashboardPageProps = {
  searchParams: Promise<{
    search?: string;
    jobStatus?: string;
    jobMode?: string;
    monthYear?: string;
    page?: string;
  }>;
};

async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const filters = parseJobsListFiltersFromSearchParamsRecord(params);

  const queryClient = new QueryClient();
  void queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.list(
      filters.search,
      filters.jobStatus,
      filters.jobMode,
      filters.monthYear,
      filters.page,
    ),
    queryFn: () =>
      getAllJobsAction({
        search: filters.search,
        jobStatus: filters.jobStatus,
        jobMode: filters.jobMode,
        monthYear: filters.monthYear,
        page: filters.page,
      }),
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.filterOptions,
    queryFn: () => getJobFilterOptionsAction(),
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
  });

  const filterCopy = DASHBOARD_COPY.filters;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPageHeader />

      <PageSectionHeader
        icon={SlidersHorizontal}
        title={filterCopy.title}
        subtitle={filterCopy.subtitle}
        className="mb-2"
      />
      <JobsFilterBar />

      <JobsResultsToolbar />

      <JobsGrid />

      <div className="mt-8 flex w-full justify-center">
        <JobsPagination />
      </div>
    </HydrationBoundary>
  );
}

export default DashboardPage;

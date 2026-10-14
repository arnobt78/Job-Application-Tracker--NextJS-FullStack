import { DashboardPageView } from "@/components/jobs/dashboard-page-view";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";
import { queryKeys } from "@/lib/query-keys";
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

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.list(
        filters.search,
        filters.jobStatus,
        filters.jobMode,
        filters.monthYear,
        filters.page
      ),
      queryFn: () =>
        getAllJobsAction({
          search: filters.search,
          jobStatus: filters.jobStatus,
          jobMode: filters.jobMode,
          monthYear: filters.monthYear,
          page: filters.page,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.filterOptions,
      queryFn: () => getJobFilterOptionsAction(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.stats.all,
      queryFn: () => getStatsAction(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPageView />
    </HydrationBoundary>
  );
}

export default DashboardPage;

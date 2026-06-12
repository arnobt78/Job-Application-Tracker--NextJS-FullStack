import ChartsContainer from "@/components/ChartsContainer";
import StatsContainer from "@/components/StatsContainer";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";
import { queryKeys } from "@/lib/query-keys";
import { getChartsDataAction, getStatsAction } from "@/utils/actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { BarChart2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Statistics",
  description:
    "Analyze your job track with pending, interview, and declined counts plus application trends over the last six months.",
  path: "/stats",
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
      {/* Page header — static server-rendered; matches dashboard pattern */}
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <BarChart2 className="h-7 w-7 text-primary" />
          Statistics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your application trends and status breakdown
        </p>
      </div>
      <StatsContainer />
      <ChartsContainer />
    </HydrationBoundary>
  );
}

export default StatsPage;

import ChartsContainer from "@/components/ChartsContainer";
import StatsContainer from "@/components/StatsContainer";
import { GlassCard } from "@/components/ui/glass-card";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";
import { queryKeys } from "@/lib/query-keys";
import { getChartsDataAction, getStatsAction } from "@/utils/actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { BarChart2, BarChart3 } from "lucide-react";

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

  // Non-blocking prefetch — shell renders immediately; client hydrates or refetches
  void queryClient.prefetchQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.charts.all,
    queryFn: () => getChartsDataAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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

      <GlassCard variant="sky" className="mt-16">
        <h2 className="mb-8 flex items-center justify-center gap-2 text-center text-4xl font-semibold">
          <BarChart3 className="h-8 w-8 text-sky-400" />
          Monthly Applications
        </h2>
        <ChartsContainer />
      </GlassCard>
    </HydrationBoundary>
  );
}

export default StatsPage;

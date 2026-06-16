"use client";

import DownloadDropdown from "@/components/DownloadDropdown";
import { PageSectionHeader } from "@/components/ui/page-section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobsListQuery } from "@/hooks/useJobsListQuery";
import { useJobsPortfolioStats } from "@/hooks/useJobsPortfolioStats";
import { DASHBOARD_COPY } from "@/lib/ui/dashboard-copy";
import { Layers } from "lucide-react";

type BreakdownItem = {
  label: string;
  value: number | undefined;
};

/** Results header: filtered count badge, global portfolio breakdown, download */
export function JobsResultsToolbar() {
  const { data: listData, isPending: listPending } = useJobsListQuery();
  const { data: portfolio, isPending: portfolioPending } =
    useJobsPortfolioStats();

  const copy = DASHBOARD_COPY.results;
  const filteredCount = listData?.count ?? 0;

  const breakdown: BreakdownItem[] = [
    { label: "Pending", value: portfolio?.pending },
    { label: "Interview", value: portfolio?.interview },
    { label: "Declined", value: portfolio?.declined },
    { label: "Full-time", value: portfolio?.fullTime },
    { label: "Part-time", value: portfolio?.partTime },
    { label: "Internship", value: portfolio?.internship },
  ];

  const countBadge = listPending ? (
    <Skeleton className="h-6 w-10 rounded-full" />
  ) : (
    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-sm font-semibold text-primary">
      {filteredCount}
    </span>
  );

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <PageSectionHeader
          icon={Layers}
          title={copy.title}
          subtitle={copy.subtitle}
          badge={countBadge}
        />
        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground sm:pl-10">
          {portfolioPending
            ? breakdown.map((item) => (
                <Skeleton key={item.label} className="h-4 w-24" />
              ))
            : breakdown.map((item, index) => (
                <span key={item.label} className="inline-flex items-center">
                  {index > 0 ? (
                    <span className="mr-2 text-muted-foreground/50" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {item.label} {item.value ?? 0}
                </span>
              ))}
        </div>
      </div>
      <div className="shrink-0 sm:ml-auto sm:self-center">
        <DownloadDropdown />
      </div>
    </div>
  );
}

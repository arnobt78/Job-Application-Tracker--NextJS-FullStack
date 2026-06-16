'use client';

import DownloadDropdown from '@/components/DownloadDropdown';
import { PortfolioBreakdownRow } from '@/components/jobs/portfolio-breakdown-row';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobsListQuery } from '@/hooks/useJobsListQuery';
import { DASHBOARD_COPY } from '@/lib/ui/dashboard-copy';
import { Layers } from 'lucide-react';

/** Results header: filtered count badge, portfolio breakdown as subtitle, download */
export function JobsResultsToolbar() {
  const { data: listData, isPending: listPending } = useJobsListQuery();
  const isInitialListLoad = listPending && listData === undefined;

  const copy = DASHBOARD_COPY.results;
  const filteredCount = listData?.count ?? 0;

  const countBadge = isInitialListLoad ? (
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
          subtitle={<PortfolioBreakdownRow />}
          badge={countBadge}
        />
      </div>
      <div className="shrink-0 sm:ml-auto sm:self-center">
        <DownloadDropdown />
      </div>
    </div>
  );
}

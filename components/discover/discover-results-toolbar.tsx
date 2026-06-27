'use client';

/**
 * DiscoverResultsToolbar — "Showing X jobs" count badge for /discover.
 * Reads from the live TanStack Query cache (SSR-prefetched so renders immediately).
 * Uses useSearchParams to build matching query key — must be inside Suspense.
 */

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { searchBluedoorJobsAction } from '@/utils/actions';
import { Layers, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSectionHeader } from '@/components/ui/page-section-header';

export function DiscoverResultsToolbar() {
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const country = searchParams.get('country') ?? 'United States';
  const workplaceType = searchParams.get('workplaceType') ?? '';
  const employmentType = searchParams.get('employmentType') ?? '';
  const salaryExists = searchParams.get('salaryExists') === 'yes';

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.discover.search(q, country, workplaceType, employmentType, salaryExists),
    queryFn: () =>
      searchBluedoorJobsAction({
        q,
        country,
        workplaceType,
        employmentType,
        salaryExists: salaryExists || undefined,
      }),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const jobs = data?.data ?? [];
  const total = data?.meta.total_matching;
  const count =
    total != null && !data?.meta.total_matching_unavailable ? total : jobs.length;

  const countBadge = isFetching && !data ? (
    <Skeleton className="h-6 min-w-[2.5rem] rounded-full" />
  ) : (
    <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-primary/15 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-primary">
      {count.toLocaleString()}
    </span>
  );

  return (
    <div className="mb-6 flex items-center gap-2">
      <PageSectionHeader
        icon={Layers}
        title="Live Postings"
        badge={countBadge}
        subtitle={
          isFetching ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Fetching latest data…
            </span>
          ) : (
            'Fresh from Greenhouse, Lever, Ashby, Workday and more'
          )
        }
      />
    </div>
  );
}

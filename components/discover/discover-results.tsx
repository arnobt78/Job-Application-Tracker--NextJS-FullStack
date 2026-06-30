'use client';

/**
 * DiscoverResults — TanStack Query-driven infinite results grid for /discover.
 *
 * Reads filter state from URL search params and calls searchBluedoorJobsAction.
 * Uses useInfiniteQuery so "Load More" appends next pages without pagination flash.
 * Discover queries are NOT persisted to localStorage — live external data, always fresh.
 *
 * Skeleton only on cold cache (useQueryBodyLoading) — SSR HydrationBoundary skips spinner.
 */

import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { buildDiscoverQueryOptions } from '@/lib/discover/query-options';
import { DiscoverJobCard } from './discover-job-card';
import { Button } from '@/components/ui/button';
import { SearchX, Loader2 } from 'lucide-react';
import { useQueryBodyLoading } from '@/lib/query-body-loading';

export function DiscoverResults() {
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const country = searchParams.get('country') ?? 'United States';
  const workplaceType = searchParams.get('workplaceType') ?? '';
  const employmentType = searchParams.get('employmentType') ?? '';
  const salaryExistsRaw = searchParams.get('salaryExists');
  const salaryExists = salaryExistsRaw === 'yes';

  const queryOptions = buildDiscoverQueryOptions(
    q,
    country,
    workplaceType,
    employmentType,
    salaryExists,
  );

  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useInfiniteQuery(queryOptions);

  const jobs = data?.pages.flatMap((page) => page.data) ?? [];
  const firstPage = data?.pages[0];
  const total = firstPage?.meta.total_matching;
  // Rate-limited: Bluedoor returned 429 → cached empty result with total_matching_unavailable flag
  const isRateLimited = firstPage?.meta.total_matching_unavailable === true && jobs.length === 0;
  const totalLabel =
    total != null && !firstPage?.meta.total_matching_unavailable
      ? `${total.toLocaleString()} jobs found`
      : jobs.length > 0
        ? `Showing ${jobs.length} jobs`
        : null;

  const bodyLoading = useQueryBodyLoading(
    queryOptions.queryKey,
    isFetching && jobs.length === 0,
  );

  if (bodyLoading) {
    return (
      <div className="flex justify-center py-16" aria-busy="true" aria-label="Loading jobs">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <SearchX className="h-10 w-10 opacity-40" />
        <p className="text-sm">Failed to load results. Check your connection and try again.</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <SearchX className="h-10 w-10 opacity-40" />
        <p className="text-sm">
          {isRateLimited
            ? 'Live listings temporarily unavailable — results will appear shortly.'
            : 'No jobs found. Try adjusting your filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {totalLabel && <span>{totalLabel}</span>}
        {isFetching && !isFetchingNextPage && (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <DiscoverJobCard key={job.job_id} job={job} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="gap-2"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isFetchingNextPage ? 'Loading…' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

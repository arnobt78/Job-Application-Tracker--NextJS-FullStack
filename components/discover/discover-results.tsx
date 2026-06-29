'use client';

/**
 * DiscoverResults — TanStack Query-driven infinite results grid for /discover.
 *
 * Reads filter state from URL search params and calls searchBluedoorJobsAction.
 * Uses useInfiniteQuery so "Load More" appends next pages without pagination flash.
 * Discover queries are NOT persisted to localStorage — live external data, always fresh.
 *
 * DiscoverCardShellGrid renders static chrome-only skeletons — prevents jarring
 * full-card flash when filters change or on cold load.
 */

import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { buildDiscoverQueryOptions } from '@/lib/discover/query-options';
import { DiscoverJobCard } from './discover-job-card';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { SearchX, Loader2, Briefcase, ExternalLink, PlusCircle, Search } from 'lucide-react';

// ─────────────────────────────────────────────
// Static card shell — chrome always visible, only text slots skeleton
// ─────────────────────────────────────────────

function DiscoverCardShell() {
  return (
    <GlassCard variant="neutral" className="flex flex-col gap-3">
      {/* Header row — icon + title skeleton + badge placeholder */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold leading-tight">
            <Briefcase className="h-4 w-4 shrink-0 text-primary" />
            <Skeleton className="h-4 w-40" />
          </h3>
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Actions — static disabled buttons matching real card chrome */}
      <div className="mt-auto flex items-center gap-2">
        <span
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 text-xs font-medium text-muted-foreground opacity-50"
          aria-hidden
        >
          <Search className="h-3.5 w-3.5" />
          Details
        </span>
        <span
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 text-xs font-medium text-primary opacity-50"
          aria-hidden
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Apply
        </span>
        <Button size="sm" variant="default" disabled className="ml-auto h-8 gap-1.5 text-xs">
          <PlusCircle className="h-3.5 w-3.5" />
          Track Application
        </Button>
      </div>
    </GlassCard>
  );
}

/** Grid of static card shells — used as Suspense fallback or on cold load */
export function DiscoverCardShellGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <DiscoverCardShell key={i} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function DiscoverResults() {
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const country = searchParams.get('country') ?? 'United States';
  const workplaceType = searchParams.get('workplaceType') ?? '';
  const employmentType = searchParams.get('employmentType') ?? '';
  const salaryExistsRaw = searchParams.get('salaryExists');
  const salaryExists = salaryExistsRaw === 'yes';

  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useInfiniteQuery(
    buildDiscoverQueryOptions(q, country, workplaceType, employmentType, salaryExists)
  );

  // Flatten all pages into a single jobs array
  const jobs = data?.pages.flatMap((page) => page.data) ?? [];
  const firstPage = data?.pages[0];
  const total = firstPage?.meta.total_matching;
  const totalLabel =
    total != null && !firstPage?.meta.total_matching_unavailable
      ? `${total.toLocaleString()} jobs found`
      : jobs.length > 0
        ? `Showing ${jobs.length} jobs`
        : null;

  // Initial cold load — show static shells (Suspense boundary handles first render)
  if (isFetching && jobs.length === 0) {
    return <DiscoverCardShellGrid />;
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
        <p className="text-sm">No jobs found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Result count + loading indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {totalLabel && <span>{totalLabel}</span>}
        {isFetching && !isFetchingNextPage && (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        )}
      </div>

      {/* Jobs grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <DiscoverJobCard key={job.job_id} job={job} />
        ))}
      </div>

      {/* Load More — only shown when server indicates a next cursor */}
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

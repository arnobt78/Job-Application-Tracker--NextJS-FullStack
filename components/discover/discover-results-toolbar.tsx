'use client';

/**
 * DiscoverResultsToolbar — total open postings badge for /discover.
 * Reads from the live TanStack Query cache (SSR-prefetched so renders immediately).
 * Uses useSearchParams to build matching query key — must be inside Suspense.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { buildDiscoverQueryOptions } from '@/lib/discover/query-options';
import { Layers, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';
import { useDiscoverSearchParams } from '@/hooks/useDiscoverSearchParams';

export function DiscoverResultsToolbar() {
  const { q, country, workplaceType, employmentType, salaryExists } = useDiscoverSearchParams();

  const isRouteFallback = useIsRouteFallback();
  const { data, isFetching } = useInfiniteQuery({
    ...buildDiscoverQueryOptions(q, country, workplaceType, employmentType, salaryExists),
    enabled: !isRouteFallback,
  });

  const total = data?.pages[0]?.meta.total ?? 0;

  const countBadge = (isFetching || isRouteFallback) && !data ? (
    <Skeleton className="h-6 min-w-[2.5rem] rounded-full" />
  ) : (
    <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-primary/15 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-primary">
      {total.toLocaleString()}
    </span>
  );

  return (
    <div className="mb-6 flex items-center gap-2">
      <PageSectionHeader
        icon={Layers}
        title="Open Postings"
        badge={countBadge}
        subtitle={
          isFetching ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating results…
            </span>
          ) : (
            'Roles from companies hiring now — track any posting in one click'
          )
        }
      />
    </div>
  );
}

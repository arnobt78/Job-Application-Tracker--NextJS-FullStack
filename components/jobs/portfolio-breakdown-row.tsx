'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useJobsPortfolioStats } from '@/hooks/useJobsPortfolioStats';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { PORTFOLIO_BREAKDOWN_ITEMS } from '@/lib/ui/portfolio-breakdown-config';
import { queryKeys } from '@/lib/query-keys';

/**
 * Portfolio stats row — icon + label always stable; skeleton only on numeric value.
 * Shown as PageSectionHeader subtitle under Matching Applications.
 */
export function PortfolioBreakdownRow() {
  const { data: portfolio, isLoading } = useJobsPortfolioStats();
  const showValueSkeleton = useQueryBodyLoading(queryKeys.stats.all, isLoading);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {PORTFOLIO_BREAKDOWN_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const value = portfolio?.[item.field] ?? 0;

        return (
          <span key={item.field} className="inline-flex items-center gap-1.5">
            {index > 0 ? (
              <span className="mr-1 text-muted-foreground/50" aria-hidden>
                ·
              </span>
            ) : null}
            <Icon
              className={`h-3.5 w-3.5 shrink-0 ${item.iconClassName}`}
              aria-hidden
            />
            <span>{item.label}</span>
            {showValueSkeleton ? (
              <Skeleton className="inline-block h-4 w-6 align-middle" />
            ) : (
              <span className="font-medium tabular-nums text-foreground">
                {value}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

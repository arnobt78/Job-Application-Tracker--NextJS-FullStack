'use client';

import { RotateCcw } from 'lucide-react';
import { useJobsListParams } from '@/hooks/useJobsListParams';
import {
  clearedJobsListFilters,
  hasActiveJobsFilters,
} from '@/lib/jobs/filter-params';
import { DASHBOARD_COPY } from '@/lib/ui/dashboard-copy';
import { cn } from '@/lib/utils';

/** Text-only clear control — lives above filter card, right-aligned with filter subtitle */
export function JobsFilterClearButton() {
  const { filters, setFilters } = useJobsListParams();

  if (!hasActiveJobsFilters(filters)) {
    return null;
  }

  const handleClear = () => {
    setFilters(clearedJobsListFilters());
  };

  return (
    <button
      type="button"
      onClick={handleClear}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground',
        'transition-colors hover:text-primary'
      )}
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
      {DASHBOARD_COPY.filters.clearLabel}
    </button>
  );
}

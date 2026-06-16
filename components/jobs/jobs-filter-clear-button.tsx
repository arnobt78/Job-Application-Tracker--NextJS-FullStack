'use client';

import { RotateCcw } from 'lucide-react';
import { useJobsListParams } from '@/hooks/useJobsListParams';
import {
  clearedJobsListFilters,
  hasActiveJobsFilters,
} from '@/lib/jobs/filter-params';
import { DASHBOARD_COPY } from '@/lib/ui/dashboard-copy';
import { cn } from '@/lib/utils';

/** Text-only clear control — always reserves width so subtitle row height stays stable */
export function JobsFilterClearButton() {
  const { filters, setFilters } = useJobsListParams();
  const isActive = hasActiveJobsFilters(filters);

  const handleClear = () => {
    setFilters(clearedJobsListFilters());
  };

  return (
    <button
      type="button"
      onClick={handleClear}
      tabIndex={isActive ? 0 : -1}
      aria-hidden={!isActive}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground',
        'transition-colors hover:text-primary',
        !isActive && 'invisible pointer-events-none'
      )}
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
      {DASHBOARD_COPY.filters.clearLabel}
    </button>
  );
}

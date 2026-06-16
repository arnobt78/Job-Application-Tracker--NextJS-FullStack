import { JobsFilterBar } from '@/components/jobs/jobs-filter-bar';
import { JobsFilterClearButton } from '@/components/jobs/jobs-filter-clear-button';
import { DASHBOARD_COPY } from '@/lib/ui/dashboard-copy';

/** Filter subtitle row + clear button above the glass filter card */
export function JobsFilterSection() {
  const filterCopy = DASHBOARD_COPY.filters;

  return (
    <>
      <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-x-4">
        <p className="min-w-0 text-sm leading-snug text-muted-foreground">
          {filterCopy.subtitle}
        </p>
        <JobsFilterClearButton />
      </div>
      <JobsFilterBar />
    </>
  );
}

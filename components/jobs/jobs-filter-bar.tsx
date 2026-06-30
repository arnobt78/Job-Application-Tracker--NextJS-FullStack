"use client";

import { Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  GlassFilterDropdown,
  getJobModeOptionIcon,
  getJobStatusOptionIcon,
} from "@/components/ui/glass-filter-dropdown";
import { GlassSearchInput } from "@/components/ui/glass-search-input";
import {
  MODE_FILTER_OPTIONS,
  MONTH_ALL_OPTION,
  STATUS_FILTER_OPTIONS,
} from "@/lib/jobs/filter-config";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useJobFilterOptions } from "@/hooks/useJobFilterOptions";
import { useJobsListParams } from "@/hooks/useJobsListParams";
import { useState } from "react";

/** Instant URL-driven search + glass filter dropdowns (clear button in JobsFilterSection) */
export function JobsFilterBar() {
  const { filters, setFilters } = useJobsListParams();
  const { data: filterOptions } = useJobFilterOptions();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [committedSearch, setCommittedSearch] = useState(filters.search);

  if (filters.search !== committedSearch) {
    setCommittedSearch(filters.search);
    if (searchInput === committedSearch) {
      setSearchInput(filters.search);
    }
  }

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setFilters({ search: value });
  }, 300);

  const statusLabel =
    STATUS_FILTER_OPTIONS.find((o) => o.value === filters.jobStatus)?.label ??
    "All Statuses";

  const modeLabel =
    MODE_FILTER_OPTIONS.find((o) => o.value === filters.jobMode)?.label ??
    "All Modes";

  const monthOptions = [MONTH_ALL_OPTION, ...(filterOptions?.months ?? [])];

  const monthLabel =
    monthOptions.find((o) => o.value === filters.monthYear)?.label ??
    MONTH_ALL_OPTION.label;

  return (
    <GlassCard variant="sky" className="mb-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassSearchInput
          value={searchInput}
          onChange={(value) => {
            setSearchInput(value);
            debouncedSetSearch(value);
          }}
          placeholder="Search position or company…"
          className="sm:col-span-2 lg:col-span-1"
        />

        <GlassFilterDropdown
          value={filters.jobStatus}
          options={STATUS_FILTER_OPTIONS}
          onChange={(jobStatus) => setFilters({ jobStatus })}
          triggerIcon={getJobStatusOptionIcon(filters.jobStatus)}
          triggerLabel={statusLabel}
          getOptionIcon={getJobStatusOptionIcon}
        />

        <GlassFilterDropdown
          value={filters.jobMode}
          options={MODE_FILTER_OPTIONS}
          onChange={(jobMode) => setFilters({ jobMode })}
          triggerIcon={getJobModeOptionIcon(filters.jobMode)}
          triggerLabel={modeLabel}
          getOptionIcon={getJobModeOptionIcon}
        />

        <GlassFilterDropdown
          value={filters.monthYear}
          options={monthOptions}
          onChange={(monthYear) => setFilters({ monthYear })}
          triggerIcon={<Calendar className="h-4 w-4" />}
          triggerLabel={monthLabel}
          getOptionIcon={() => <Calendar className="h-4 w-4" />}
        />
      </div>
    </GlassCard>
  );
}

export default JobsFilterBar;

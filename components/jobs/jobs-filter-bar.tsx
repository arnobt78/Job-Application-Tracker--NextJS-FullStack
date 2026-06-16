"use client";

import type { ReactNode } from "react";
import {
  Briefcase,
  Calendar,
  CalendarCheck,
  Clock,
  Filter,
  XCircle,
} from "lucide-react";
import { JobMode } from "@/utils/types";
import { GlassCard } from "@/components/ui/glass-card";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GlassDropdownContent,
  GlassDropdownRadioItem,
  GlassDropdownTrigger,
} from "@/components/ui/glass-dropdown-menu";
import { GlassSearchInput } from "@/components/ui/glass-search-input";
import {
  MODE_FILTER_OPTIONS,
  MONTH_ALL_OPTION,
  STATUS_FILTER_OPTIONS,
  type FilterOption,
} from "@/lib/jobs/filter-config";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useJobFilterOptions } from "@/hooks/useJobFilterOptions";
import { useJobsListParams } from "@/hooks/useJobsListParams";
import {
  clearedJobsListFilters,
  hasActiveJobsFilters,
} from "@/lib/jobs/filter-params";
import { DASHBOARD_COPY } from "@/lib/ui/dashboard-copy";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

const statusIcons: Record<string, ReactNode> = {
  all: <Filter className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4 text-amber-400" />,
  interview: <CalendarCheck className="h-4 w-4 text-emerald-400" />,
  declined: <XCircle className="h-4 w-4 text-rose-400" />,
};

const modeIcons: Record<string, ReactNode> = {
  all: <Briefcase className="h-4 w-4" />,
  [JobMode.FullTime]: <Briefcase className="h-4 w-4" />,
  [JobMode.PartTime]: <Briefcase className="h-4 w-4" />,
  [JobMode.Internship]: <Briefcase className="h-4 w-4" />,
};

type FilterDropdownProps = {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  triggerIcon: ReactNode;
  triggerLabel: string;
  align?: "start" | "center" | "end";
  getOptionIcon?: (value: string) => ReactNode;
};

function FilterDropdown({
  value,
  options,
  onChange,
  triggerIcon,
  triggerLabel,
  align = "start",
  getOptionIcon,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GlassDropdownTrigger className="shadow-[0_12px_40px_rgba(2,132,199,0.15)]">
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-muted-foreground">
              {triggerIcon}
            </span>
            <span className="truncate">{triggerLabel}</span>
          </span>
        </GlassDropdownTrigger>
      </DropdownMenuTrigger>
      <GlassDropdownContent
        align={align}
        collisionPadding={8}
        sideOffset={8}
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <GlassDropdownRadioItem
              key={option.value}
              value={option.value}
              label={option.label}
              icon={getOptionIcon?.(option.value)}
            />
          ))}
        </DropdownMenuRadioGroup>
      </GlassDropdownContent>
    </DropdownMenu>
  );
}

/** Instant URL-driven search + glass filter dropdowns (no submit button) */
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

  const showClear = hasActiveJobsFilters(filters);

  const handleClearFilters = () => {
    const cleared = clearedJobsListFilters();
    setSearchInput(cleared.search);
    setCommittedSearch(cleared.search);
    setFilters(cleared);
  };

  return (
    <GlassCard variant="sky" className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassSearchInput
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              debouncedSetSearch(value);
            }}
            placeholder="Search position or company…"
            className="sm:col-span-2 lg:col-span-1"
          />

          <FilterDropdown
            value={filters.jobStatus}
            options={STATUS_FILTER_OPTIONS}
            onChange={(jobStatus) => setFilters({ jobStatus })}
            triggerIcon={statusIcons[filters.jobStatus] ?? statusIcons.all}
            triggerLabel={statusLabel}
            getOptionIcon={(v) => statusIcons[v]}
          />

          <FilterDropdown
            value={filters.jobMode}
            options={MODE_FILTER_OPTIONS}
            onChange={(jobMode) => setFilters({ jobMode })}
            triggerIcon={modeIcons[filters.jobMode] ?? modeIcons.all}
            triggerLabel={modeLabel}
            getOptionIcon={(v) => modeIcons[v]}
          />

          <FilterDropdown
            value={filters.monthYear}
            options={monthOptions}
            onChange={(monthYear) => setFilters({ monthYear })}
            triggerIcon={<Calendar className="h-4 w-4" />}
            triggerLabel={monthLabel}
            getOptionIcon={() => <Calendar className="h-4 w-4" />}
          />
        </div>

        {showClear ? (
          <button
            type="button"
            onClick={handleClearFilters}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground',
              'transition-colors hover:text-primary'
            )}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {DASHBOARD_COPY.filters.clearLabel}
          </button>
        ) : null}
      </div>
    </GlassCard>
  );
}

export default JobsFilterBar;

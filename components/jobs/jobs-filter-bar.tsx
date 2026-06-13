'use client';

import type { ReactNode } from 'react';
import {
  Briefcase,
  Calendar,
  CalendarCheck,
  Clock,
  Filter,
  XCircle,
} from 'lucide-react';
import { JobMode } from '@/utils/types';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GlassDropdownContent,
  GlassDropdownRadioItem,
} from '@/components/ui/glass-dropdown-menu';
import { GlassSearchInput } from '@/components/ui/glass-search-input';
import {
  MODE_FILTER_OPTIONS,
  MONTH_ALL_OPTION,
  STATUS_FILTER_OPTIONS,
  type FilterOption,
} from '@/lib/jobs/filter-config';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useJobFilterOptions } from '@/hooks/useJobFilterOptions';
import { useJobsListParams } from '@/hooks/useJobsListParams';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
  align?: 'start' | 'center' | 'end';
  getOptionIcon?: (value: string) => ReactNode;
};

function FilterDropdown({
  value,
  options,
  onChange,
  triggerIcon,
  triggerLabel,
  align = 'start',
  getOptionIcon,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'glass-input h-10 w-full justify-start gap-2 px-3 font-normal',
            'shadow-[0_12px_40px_rgba(2,132,199,0.15)]'
          )}
        >
          <span className="shrink-0 text-muted-foreground">{triggerIcon}</span>
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <GlassDropdownContent align={align} className="w-[var(--radix-dropdown-menu-trigger-width)]">
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
    'All Statuses';

  const modeLabel =
    MODE_FILTER_OPTIONS.find((o) => o.value === filters.jobMode)?.label ??
    'All Modes';

  const monthOptions = [
    MONTH_ALL_OPTION,
    ...(filterOptions?.months ?? []),
  ];

  const monthLabel =
    monthOptions.find((o) => o.value === filters.monthYear)?.label ??
    MONTH_ALL_OPTION.label;

  return (
    <GlassCard variant="sky" className="mb-16">
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
    </GlassCard>
  );
}

export default JobsFilterBar;

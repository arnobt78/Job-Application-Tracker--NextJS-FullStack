'use client';

/**
 * DiscoverFilters — glass-styled filter bar for /discover page.
 *
 * Uses the same GlassDropdownTrigger/Content/RadioItem pattern as jobs-filter-bar.tsx.
 * Wrapped in GlassCard variant="sky" to match the dashboard filter card style.
 * URL-driven — updates search params on change, no local state except debounced input.
 *
 * The clear button + subtitle row live in DiscoverFilterSection (parent), matching
 * the JobsFilterSection pattern.
 *
 * Facet counts from Bluedoor /jobs/facets are shown inline in each filter option.
 */

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassSearchInput } from '@/components/ui/glass-search-input';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GlassDropdownContent,
  GlassDropdownRadioItem,
  GlassDropdownTrigger,
} from '@/components/ui/glass-dropdown-menu';
import { Globe2, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { queryKeys } from '@/lib/query-keys';
import { getBluedoorFacetsAction } from '@/utils/actions';
import type { ReactNode } from 'react';
import type { DiscoverFacets } from '@/lib/bluedoor/types';

// ─────────────────────────────────────────────
// Filter options
// ─────────────────────────────────────────────

const WORKPLACE_OPTIONS = [
  { value: 'all', label: 'All locations' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on_site', label: 'On-site' },
] as const;

const EMPLOYMENT_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
] as const;

const SALARY_OPTIONS = [
  { value: 'all', label: 'Any salary' },
  { value: 'yes', label: 'Salary disclosed' },
] as const;

const COUNTRY_OPTIONS = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
] as const;

// ─────────────────────────────────────────────
// Shared filter dropdown
// ─────────────────────────────────────────────

type FilterOption = { value: string; label: string };

type FilterDropdownProps = {
  value: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
  triggerIcon: ReactNode;
  triggerLabel: string;
  /** Optional facet counts keyed by option value */
  facetCounts?: Record<string, number>;
};

function FilterDropdown({
  value,
  options,
  onChange,
  triggerIcon,
  triggerLabel,
  facetCounts,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GlassDropdownTrigger className="shadow-[0_12px_40px_rgba(2,132,199,0.15)]">
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-muted-foreground">{triggerIcon}</span>
            <span className="truncate">{triggerLabel}</span>
          </span>
        </GlassDropdownTrigger>
      </DropdownMenuTrigger>
      <GlassDropdownContent
        align="start"
        collisionPadding={8}
        sideOffset={8}
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => {
            const count = facetCounts?.[option.value];
            return (
              <GlassDropdownRadioItem
                key={option.value}
                value={option.value}
                label={
                  count != null && option.value !== 'all'
                    ? `${option.label} (${count.toLocaleString()})`
                    : option.label
                }
              />
            );
          })}
        </DropdownMenuRadioGroup>
      </GlassDropdownContent>
    </DropdownMenu>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

function toFacetCounts(items: DiscoverFacets['workplace_type']): Record<string, number> {
  return Object.fromEntries(items.map((f) => [f.value, f.count]));
}

export function DiscoverFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const q = searchParams.get('q') ?? '';
  const [searchValue, setSearchValue] = useState(q);
  const country = searchParams.get('country') ?? 'United States';
  const workplaceType = searchParams.get('workplaceType') ?? 'all';
  const employmentType = searchParams.get('employmentType') ?? 'all';
  const salaryExists = searchParams.get('salaryExists') ?? 'all';

  // Live facet counts — staleTime 5 min, NOT persisted, graceful empty on error
  const { data: facets } = useQuery({
    queryKey: queryKeys.discover.facets(q || undefined, country !== 'United States' ? country : undefined),
    queryFn: () => getBluedoorFacetsAction({ q: q || undefined, country }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const workplaceCounts = facets ? toFacetCounts(facets.workplace_type) : undefined;
  const employmentCounts = facets ? toFacetCounts(facets.employment_type) : undefined;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    updateParam('q', value);
  }, 400);

  function onSearchChange(value: string) {
    setSearchValue(value);
    handleSearch(value);
  }

  const countryLabel =
    COUNTRY_OPTIONS.find((o) => o.value === country)?.label ?? 'United States';
  const workplaceLabel =
    WORKPLACE_OPTIONS.find((o) => o.value === workplaceType)?.label ?? 'All locations';
  const employmentLabel =
    EMPLOYMENT_OPTIONS.find((o) => o.value === employmentType)?.label ?? 'All types';
  const salaryLabel =
    SALARY_OPTIONS.find((o) => o.value === salaryExists)?.label ?? 'Any salary';

  return (
    <GlassCard variant="sky" className="mb-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search input — spans 2 cols on sm to balance the 4-col grid */}
        <GlassSearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search title, role, department…"
          className="sm:col-span-2 lg:col-span-1"
        />

        {/* Country */}
        <FilterDropdown
          value={country}
          options={COUNTRY_OPTIONS}
          onChange={(v) => updateParam('country', v)}
          triggerIcon={<Globe2 className="h-4 w-4" />}
          triggerLabel={countryLabel}
        />

        {/* Workplace type — shows live Bluedoor facet counts */}
        <FilterDropdown
          value={workplaceType}
          options={WORKPLACE_OPTIONS}
          onChange={(v) => updateParam('workplaceType', v)}
          triggerIcon={<MapPin className="h-4 w-4" />}
          triggerLabel={workplaceLabel}
          facetCounts={workplaceCounts}
        />

        {/* Employment type — shows live Bluedoor facet counts */}
        <FilterDropdown
          value={employmentType}
          options={EMPLOYMENT_OPTIONS}
          onChange={(v) => updateParam('employmentType', v)}
          triggerIcon={<Briefcase className="h-4 w-4" />}
          triggerLabel={employmentLabel}
          facetCounts={employmentCounts}
        />

        {/* Salary filter */}
        <FilterDropdown
          value={salaryExists}
          options={SALARY_OPTIONS}
          onChange={(v) => updateParam('salaryExists', v)}
          triggerIcon={<DollarSign className="h-4 w-4" />}
          triggerLabel={salaryLabel}
        />
      </div>
    </GlassCard>
  );
}

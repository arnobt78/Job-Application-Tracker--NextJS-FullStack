'use client';

/**
 * DiscoverSidebar — sticky left-rail filter panel for /discover (lg+ screens).
 *
 * Replaces the horizontal filter bar on desktop. Renders inline radio groups
 * for Country, Workplace, Employment, and Salary filters, plus a debounced
 * search input. All state is URL-driven (same pattern as DiscoverFilters).
 *
 * Mobile: hidden (lg:hidden on this component's wrapper in page.tsx).
 * Desktop: `sticky top-4 h-fit` inside a `w-64 shrink-0` column.
 *
 * Facet counts come from the same queryKeys.discover.facets(...) cache that
 * the page SSR-prefetches, so no extra network request.
 */

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassSearchInput } from '@/components/ui/glass-search-input';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { queryKeys } from '@/lib/query-keys';
import { getBluedoorFacetsAction } from '@/utils/actions';
import { cn } from '@/lib/utils';
import {
  WORKPLACE_OPTIONS,
  EMPLOYMENT_OPTIONS,
  SALARY_OPTIONS,
  COUNTRY_OPTIONS,
} from './discover-filters';
import type { DiscoverFacets } from '@/lib/bluedoor/types';

// ─────────────────────────────────────────────
// Inline radio group section
// ─────────────────────────────────────────────

type RadioOption = { value: string; label: string };

type SidebarRadioSectionProps = {
  /** Section heading */
  title: string;
  /** Radio group name for accessibility */
  name: string;
  options: readonly RadioOption[];
  value: string;
  onChange: (value: string) => void;
  /** Optional facet counts keyed by option value */
  facetCounts?: Record<string, number>;
};

function SidebarRadioSection({
  title,
  name,
  options,
  value,
  onChange,
  facetCounts,
}: SidebarRadioSectionProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </p>
      {options.map((option) => {
        const count = facetCounts?.[option.value];
        const active = value === option.value;
        return (
          <label
            key={option.value}
            className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/5"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {/* Custom radio indicator */}
            <span
              className={cn(
                'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors',
                active
                  ? 'border-sky-400 bg-sky-500/20'
                  : 'border-muted-foreground/30 group-hover:border-sky-300/50'
              )}
            >
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              )}
            </span>
            {/* Label */}
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm transition-colors',
                active
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground group-hover:text-foreground/80'
              )}
            >
              {option.label}
            </span>
            {/* Facet count — not shown for "all" option */}
            {count != null && option.value !== 'all' && (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground/50">
                {count.toLocaleString()}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

function Divider() {
  return <div className="my-3 h-px bg-white/10" />;
}

function toFacetCounts(
  items: DiscoverFacets['workplace_type']
): Record<string, number> {
  return Object.fromEntries(items.map((f) => [f.value, f.count]));
}

// ─────────────────────────────────────────────
// Sidebar component
// ─────────────────────────────────────────────

type DiscoverSidebarProps = {
  className?: string;
};

export function DiscoverSidebar({ className }: DiscoverSidebarProps) {
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

  const hasFilters =
    !!q ||
    (!!country && country !== 'United States') ||
    (!!workplaceType && workplaceType !== 'all') ||
    (!!employmentType && employmentType !== 'all') ||
    (!!salaryExists && salaryExists !== 'all');

  // Facet counts — same key as DiscoverFilters; hits SSR cache first
  const { data: facets } = useQuery({
    queryKey: queryKeys.discover.facets(
      q || undefined,
      country !== 'United States' ? country : undefined
    ),
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

  function clearFilters() {
    setSearchValue('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <aside className={cn('sticky top-4 h-fit', className)}>
      <GlassCard variant="sky" className="flex flex-col gap-0 p-4">
        {/* Header row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
            Filters
          </div>
          {/* Reserve space so layout never shifts */}
          <div className={cn(hasFilters ? 'visible' : 'invisible')}>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>

        {/* Search */}
        <GlassSearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Title, role, department…"
        />

        <Divider />

        {/* Country */}
        <SidebarRadioSection
          title="Country"
          name="sidebar-country"
          options={COUNTRY_OPTIONS}
          value={country}
          onChange={(v) => updateParam('country', v)}
        />

        <Divider />

        {/* Workplace type */}
        <SidebarRadioSection
          title="Workplace"
          name="sidebar-workplace"
          options={WORKPLACE_OPTIONS}
          value={workplaceType}
          onChange={(v) => updateParam('workplaceType', v)}
          facetCounts={workplaceCounts}
        />

        <Divider />

        {/* Employment type */}
        <SidebarRadioSection
          title="Employment"
          name="sidebar-employment"
          options={EMPLOYMENT_OPTIONS}
          value={employmentType}
          onChange={(v) => updateParam('employmentType', v)}
          facetCounts={employmentCounts}
        />

        <Divider />

        {/* Salary */}
        <SidebarRadioSection
          title="Salary"
          name="sidebar-salary"
          options={SALARY_OPTIONS}
          value={salaryExists}
          onChange={(v) => updateParam('salaryExists', v)}
        />
      </GlassCard>
    </aside>
  );
}

'use client';

/**
 * DiscoverFilterSection — subtitle row + clear button above the glass filter card.
 * Mirrors JobsFilterSection pattern. Uses useSearchParams so must be inside Suspense.
 */

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { DiscoverFilters } from './discover-filters';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DiscoverFilterSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get('q') ?? '';
  const country = searchParams.get('country') ?? '';
  const workplaceType = searchParams.get('workplaceType') ?? '';
  const employmentType = searchParams.get('employmentType') ?? '';
  const salaryExists = searchParams.get('salaryExists') ?? '';

  const hasFilters =
    !!q ||
    (!!country && country !== 'United States') ||
    !!workplaceType ||
    !!employmentType ||
    !!salaryExists;

  function clearFilters() {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <>
      {/* Subtitle + clear button row — mirrors JobsFilterSection */}
      <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-x-4">
        <p className="min-w-0 text-sm leading-snug text-muted-foreground">
          Filter by location, workplace type, employment type, or salary
        </p>
        {/* Reserve width so layout never shifts when button appears */}
        <div className={cn(hasFilters ? 'visible' : 'invisible')}>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        </div>
      </div>

      <DiscoverFilters />
    </>
  );
}

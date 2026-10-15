'use client';

import { useSearchParams } from 'next/navigation';
import { DEFAULT_DISCOVER_COUNTRY } from '@/lib/discover/query-options';
import type { DiscoverSearchParams } from '@/lib/postings/types';

/** Discover filters read from the URL — same defaults as the SSR prefetch in discover/page.tsx. */
export function useDiscoverSearchParams(): DiscoverSearchParams {
  const searchParams = useSearchParams();
  return {
    q: searchParams.get('q') ?? '',
    country: searchParams.get('country') ?? DEFAULT_DISCOVER_COUNTRY,
    workplaceType: searchParams.get('workplaceType') ?? '',
    employmentType: searchParams.get('employmentType') ?? '',
    salaryExists: searchParams.get('salaryExists') === 'yes',
  };
}

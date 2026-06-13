'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { JobsListFilters } from '@/lib/jobs/filter-types';
import {
  buildJobsListSearchParams,
  parseJobsListFilters,
} from '@/lib/jobs/filter-params';

/** Read/write bookmarkable dashboard filter params via router.replace */
export function useJobsListParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(
    () => parseJobsListFilters(searchParams),
    [searchParams]
  );

  const setFilters = useCallback(
    (patch: Partial<JobsListFilters>, resetPage = true) => {
      const next: JobsListFilters = {
        ...filters,
        ...patch,
        page: resetPage ? 1 : (patch.page ?? filters.page),
      };
      const qs = buildJobsListSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  return { filters, setFilters };
}

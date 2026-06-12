'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAllJobsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';

/** Shared jobs list query for dashboard count, pagination, and grid */
export function useJobsListQuery() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const jobStatus = searchParams.get('jobStatus') || 'all';
  const pageNumber = Number(searchParams.get('page')) || 1;

  return useQuery({
    queryKey: queryKeys.jobs.list(search, jobStatus, pageNumber),
    queryFn: () => getAllJobsAction({ search, jobStatus, page: pageNumber }),
  });
}

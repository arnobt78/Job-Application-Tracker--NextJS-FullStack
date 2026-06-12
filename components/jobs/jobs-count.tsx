'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useJobsListQuery } from '@/hooks/useJobsListQuery';

/** Job count only — "jobs found" label lives in page.tsx */
export function JobsCount() {
  const { data, isPending } = useJobsListQuery();

  if (isPending) {
    return <Skeleton className="h-7 w-8" />;
  }

  return <span>{data?.count ?? 0}</span>;
}

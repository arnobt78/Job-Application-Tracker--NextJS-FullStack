'use client';

import ComplexButtonContainer from '@/components/ComplexButtonContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobsListBodyLoading } from '@/hooks/useJobsListBodyLoading';

export function JobsPagination() {
  const { data, bodyLoading } = useJobsListBodyLoading();

  if (bodyLoading) {
    return <Skeleton className="h-9 w-40 rounded-2xl" />;
  }

  const totalPages = data?.totalPages ?? 0;
  if (totalPages <= 1) return null;

  return (
    <div className="flex w-full justify-center">
      <ComplexButtonContainer
        currentPage={data?.page ?? 1}
        totalPages={totalPages}
      />
    </div>
  );
}

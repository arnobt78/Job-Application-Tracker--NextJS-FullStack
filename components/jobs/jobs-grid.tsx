'use client';

import JobCard from '@/components/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { UI_DIMENSIONS } from '@/lib/ui/dimensions';
import { useJobsListQuery } from '@/hooks/useJobsListQuery';
import { Briefcase } from 'lucide-react';

/** Job cards grid — skeleton cards while loading; empty state when no results */
export function JobsGrid() {
  const { data, isPending } = useJobsListQuery();
  const jobs = data?.jobs ?? [];
  const { heightClass, roundedClass } = UI_DIMENSIONS.jobCard;

  if (!isPending && jobs.length < 1) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Briefcase className="h-10 w-10" />
        <h2 className="text-xl font-semibold">No jobs found</h2>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="grid w-full gap-8 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={`${heightClass} w-full ${roundedClass}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

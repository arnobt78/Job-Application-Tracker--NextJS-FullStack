'use client';

import JobCard from './JobCard';
import { useSearchParams } from 'next/navigation';
import { getAllJobsAction } from '@/utils/actions';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import ComplexButtonContainer from './ComplexButtonContainer';
import DownloadDropdown from './DownloadDropdown';
import { Skeleton } from './ui/skeleton';
import { Briefcase } from 'lucide-react';
import { UI_DIMENSIONS } from '@/lib/ui/dimensions';

function JobsList() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const jobStatus = searchParams.get('jobStatus') || 'all';
  const pageNumber = Number(searchParams.get('page')) || 1;

  const { data, isPending } = useQuery({
    queryKey: queryKeys.jobs.list(search, jobStatus, pageNumber),
    queryFn: () => getAllJobsAction({ search, jobStatus, page: pageNumber }),
  });

  const jobs = data?.jobs || [];
  const count = data?.count || 0;
  const page = data?.page || 0;
  const totalPages = data?.totalPages || 0;
  const { heightClass, roundedClass } = UI_DIMENSIONS.jobCard;

  if (!isPending && jobs.length < 1) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Briefcase className="h-10 w-10" />
        <h2 className="text-xl font-semibold">No jobs found</h2>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold capitalize">
            <Briefcase className="h-5 w-5 text-primary" />
            {isPending ? (
              <Skeleton className="h-7 w-36" />
            ) : (
              `${count} jobs found`
            )}
          </h2>
          {!isPending && <DownloadDropdown />}
        </div>
        {!isPending && totalPages > 1 ? (
          <ComplexButtonContainer currentPage={page} totalPages={totalPages} />
        ) : null}
      </div>

      {isPending ? (
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className={`${heightClass} w-full ${roundedClass}`} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}

export default JobsList;

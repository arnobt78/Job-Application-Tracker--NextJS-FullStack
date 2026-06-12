import SearchForm from '@/components/SearchForm';
import DownloadDropdown from '@/components/DownloadDropdown';
import { JobsCount } from '@/components/jobs/jobs-count';
import { JobsGrid } from '@/components/jobs/jobs-grid';
import { JobsPagination } from '@/components/jobs/jobs-pagination';
import { AddJobDialog } from '@/components/dialogs/add-job-dialog';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAllJobsAction } from '@/utils/actions';
import { Briefcase, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Dashboard',
  description:
    'View, search, and filter all your job applications. Add new applications and track your progress.',
  path: '/dashboard',
  noIndex: true,
});

type DashboardPageProps = {
  searchParams: Promise<{
    search?: string;
    jobStatus?: string;
    page?: string;
  }>;
};

async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const search = params.search ?? '';
  const jobStatus = params.jobStatus ?? 'all';
  const pageNumber = Number(params.page) || 1;

  const queryClient = new QueryClient();
  void queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.list(search, jobStatus, pageNumber),
    queryFn: () => getAllJobsAction({ search, jobStatus, page: pageNumber }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Briefcase className="h-7 w-7 text-primary" />
            My Jobs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <AddJobDialog />
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Search &amp; filter
      </div>
      <SearchForm />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold capitalize">
            <Briefcase className="h-5 w-5 text-primary" />
            <JobsCount />
            <span>jobs found</span>
          </h2>
          <DownloadDropdown />
        </div>
        <JobsPagination />
      </div>

      <JobsGrid />
    </HydrationBoundary>
  );
}

export default DashboardPage;

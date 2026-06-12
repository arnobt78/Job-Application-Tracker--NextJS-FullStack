import SearchForm from '@/components/SearchForm';
import JobsList from '@/components/JobsList';
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
import { Briefcase } from 'lucide-react';

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

  // SSR prefetch — hydrates client useQuery with no loading state on first paint
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.list(search, jobStatus, pageNumber),
    queryFn: () => getAllJobsAction({ search, jobStatus, page: pageNumber }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Page header — static server-rendered; no flash */}
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
        {/* AddJobDialog — client component, renders trigger button + dialog */}
        <AddJobDialog />
      </div>

      {/* Filter row — client component with URL search params */}
      <SearchForm />

      {/* Jobs grid — client component, hydrated from SSR prefetch */}
      <JobsList />
    </HydrationBoundary>
  );
}

export default DashboardPage;

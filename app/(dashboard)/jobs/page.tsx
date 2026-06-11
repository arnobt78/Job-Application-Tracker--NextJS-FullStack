import JobsList from '@/components/JobsList';
import SearchForm from '@/components/SearchForm';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAllJobsAction } from '@/utils/actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'All Jobs',
  description:
    'View, search, and filter all your job applications in one place. Export your job history as CSV or Excel.',
  path: '/jobs',
  noIndex: true,
});

type JobsPageProps = {
  searchParams: Promise<{
    search?: string;
    jobStatus?: string;
    page?: string;
  }>;
};

async function AllJobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const search = params.search ?? '';
  const jobStatus = params.jobStatus ?? 'all';
  const pageNumber = Number(params.page) || 1;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.list(search, jobStatus, pageNumber),
    queryFn: () =>
      getAllJobsAction({ search, jobStatus, page: pageNumber }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchForm />
      <JobsList />
    </HydrationBoundary>
  );
}

export default AllJobsPage;

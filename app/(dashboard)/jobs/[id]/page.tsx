import EditJobForm from '@/components/EditJobForm';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import { getSingleJobAction } from '@/utils/actions';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Edit Job',
  description: 'Update or delete a job application in your Jobify tracker.',
  path: '/jobs',
  noIndex: true,
});

async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.job.detail(params.id),
    queryFn: () => getSingleJobAction(params.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditJobForm jobId={params.id} />
    </HydrationBoundary>
  );
}

export default JobDetailPage;

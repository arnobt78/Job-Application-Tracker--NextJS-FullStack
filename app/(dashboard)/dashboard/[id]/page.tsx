import { EditJobDialogPage } from '@/components/pages/edit-job-dialog-page';
import { queryKeys } from '@/lib/query-keys';
import { getSingleJobAction } from '@/utils/actions';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Edit Job',
  description: 'Update or delete a job application in your Jobify tracker.',
  path: '/dashboard',
  noIndex: true,
});

/**
 * Direct URL access to job edit dialog — e.g. /dashboard/abc123.
 * Prefetches job data server-side so EditJobForm has no loading flash.
 * Renders EditJobDialogPage (client) which opens the dialog immediately.
 */
export default async function JobEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();
  void queryClient.prefetchQuery({
    queryKey: queryKeys.job.detail(id),
    queryFn: () => getSingleJobAction(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditJobDialogPage jobId={id} />
    </HydrationBoundary>
  );
}

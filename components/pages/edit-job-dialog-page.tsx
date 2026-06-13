'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { EditJobDialog } from '@/components/dialogs/edit-job-dialog';
import { queryKeys } from '@/lib/query-keys';
import { getSingleJobAction } from '@/utils/actions';

type EditJobDialogPageProps = { jobId: string };

/**
 * Client shell for /dashboard/[id] — holds useRouter for dialog close navigation.
 * Job data is pre-fetched by server parent into HydrationBoundary.
 */
export function EditJobDialogPage({ jobId }: EditJobDialogPageProps) {
  const router = useRouter();
  const { data: job } = useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getSingleJobAction(jobId),
  });

  if (!job) return null;

  return (
    <EditJobDialog
      job={{ id: job.id, position: job.position, company: job.company }}
      defaultOpen={true}
      onExternalClose={() => router.push('/dashboard')}
    />
  );
}

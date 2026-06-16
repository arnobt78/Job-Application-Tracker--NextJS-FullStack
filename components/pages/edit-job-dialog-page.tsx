'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { EditJobDialog } from '@/components/dialogs/edit-job-dialog';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { getSingleJobAction } from '@/utils/actions';

type EditJobDialogPageProps = { jobId: string };

/**
 * Client shell for /dashboard/[id] — holds useRouter for dialog close navigation.
 * SSR prefetch + bodyLoading keeps dialog chrome mounted on refresh (no blank frame).
 */
export function EditJobDialogPage({ jobId }: EditJobDialogPageProps) {
  const router = useRouter();
  const { data: job, isLoading } = useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getSingleJobAction(jobId),
    staleTime: 60_000,
  });
  const bodyLoading = useQueryBodyLoading(
    queryKeys.job.detail(jobId),
    isLoading
  );

  const shellJob = job ?? {
    id: jobId,
    position: '',
    company: '',
  };

  return (
    <EditJobDialog
      job={{ id: shellJob.id, position: shellJob.position, company: shellJob.company }}
      defaultOpen={true}
      formLoading={bodyLoading}
      onExternalClose={() => router.push('/dashboard')}
    />
  );
}

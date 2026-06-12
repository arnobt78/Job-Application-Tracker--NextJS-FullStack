'use client';

import { useRouter } from 'next/navigation';
import { EditJobDialog } from '@/components/dialogs/edit-job-dialog';

type EditJobDialogPageProps = { jobId: string };

/**
 * Client shell for /dashboard/[id] — holds useRouter for dialog close navigation.
 * Job data is pre-fetched by server parent into HydrationBoundary.
 */
export function EditJobDialogPage({ jobId }: EditJobDialogPageProps) {
  const router = useRouter();

  return (
    <EditJobDialog
      jobId={jobId}
      defaultOpen={true}
      onExternalClose={() => router.push('/dashboard')}
    />
  );
}

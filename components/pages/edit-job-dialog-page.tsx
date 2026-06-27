'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { EditJobDialog } from '@/components/dialogs/edit-job-dialog';
import { AiInsightsPanel } from '@/components/jobs/ai-insights-panel';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { getSingleJobAction } from '@/utils/actions';
import type { PipelineJobInput } from '@/lib/ai/pipeline-client';
import type { JobType } from '@/utils/types';

type EditJobDialogPageProps = { jobId: string };

/** Map a full JobType → PipelineJobInput for the AI pipeline. */
function toPipelineJobInput(job: JobType): PipelineJobInput {
  return {
    job_id: job.id,
    position: job.position,
    company: job.company,
    location: job.location,
    status: job.status,
    mode: job.mode,
    apply_url: job.applyUrl ?? null,
    bluedoor_status: job.bluedoorStatus ?? null,
    bluedoor_workplace_type: job.bluedoorWorkplaceType ?? null,
    bluedoor_salary_min: job.bluedoorSalaryMin ?? null,
    bluedoor_salary_max: job.bluedoorSalaryMax ?? null,
    bluedoor_salary_currency: job.bluedoorSalaryCurrency ?? null,
  };
}

/**
 * Client shell for /dashboard/[id] — holds useRouter for dialog close navigation.
 * SSR prefetch + bodyLoading keeps dialog chrome mounted on refresh (no blank frame).
 * Passes AiInsightsPanel into EditJobDialog as an optional aiPanel slot.
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

  // Only build AI panel when full job data is available (no loading shell)
  const aiPanel = job ? (
    <AiInsightsPanel job={toPipelineJobInput(job)} />
  ) : null;

  return (
    <EditJobDialog
      job={{ id: shellJob.id, position: shellJob.position, company: shellJob.company }}
      defaultOpen={true}
      formLoading={bodyLoading}
      onExternalClose={() => router.push('/dashboard')}
      aiPanel={aiPanel}
    />
  );
}

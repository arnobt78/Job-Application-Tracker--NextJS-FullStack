"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { EditJobDialog } from "@/components/dialogs/edit-job-dialog";
import { JobDetailPanels } from "@/components/jobs/job-detail-panels";
import { useIsRouteFallback } from "@/components/providers/route-fallback-provider";
import { queryKeys } from "@/lib/query-keys";
import { useQueryBodyLoading } from "@/lib/query-body-loading";
import { getSingleJobAction } from "@/utils/actions";
import { toPipelineJobInput } from "@/lib/ai/pipeline-client";

type EditJobDialogPageProps = { jobId: string };

export function EditJobDialogPage({ jobId }: EditJobDialogPageProps) {
  const router = useRouter();
  const isRouteFallback = useIsRouteFallback();
  const { data: job, isLoading } = useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getSingleJobAction(jobId),
    staleTime: 60_000,
    enabled: !isRouteFallback,
  });
  const bodyLoading = useQueryBodyLoading(
    queryKeys.job.detail(jobId),
    isLoading,
  );

  const shellJob = job ?? { id: jobId, position: "", company: "" };

  // Fallback keeps the form in its skeleton state and skips the AI panels (their queries would fetch)
  const aiPanel =
    job && !isRouteFallback ? (
      <JobDetailPanels
        job={toPipelineJobInput(job)}
        bluedoorJobId={job.bluedoorJobId ?? null}
      />
    ) : null;

  return (
    <EditJobDialog
      job={{
        id: shellJob.id,
        position: shellJob.position,
        company: shellJob.company,
      }}
      defaultOpen={true}
      formLoading={bodyLoading || isRouteFallback}
      onExternalClose={() => router.push("/dashboard")}
      aiPanel={aiPanel}
    />
  );
}

/** Route loading fallback — loading.tsx has no params, so read the job id from the URL */
export function EditJobDialogPageFallback() {
  const { id } = useParams<{ id?: string }>();
  return id ? <EditJobDialogPage jobId={id} /> : null;
}

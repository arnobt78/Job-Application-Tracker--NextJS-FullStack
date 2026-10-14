'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import {
  JobStatus,
  JobMode,
  createAndEditJobSchema,
  CreateAndEditJobType,
  type JobType,
} from '@/utils/types';
import { Form } from '@/components/ui/form';
import { CustomFormField, CustomFormFilterDropdown } from './FormComponents';
import {
  JOB_FORM_MODE_OPTIONS,
  JOB_FORM_STATUS_OPTIONS,
} from '@/lib/jobs/filter-config';
import {
  getJobModeOptionIcon,
  getJobStatusOptionIcon,
} from '@/components/ui/glass-filter-dropdown';
import { useQuery } from '@tanstack/react-query';
import { useIsRouteFallback } from '@/components/providers/route-fallback-provider';
import { getSingleJobAction } from '@/utils/actions';
import { useUpdateJobMutation } from '@/hooks/useJobsMutation';
import { queryKeys } from '@/lib/query-keys';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { JobFormDialogHeader } from '@/components/jobs/job-form-dialog-header';
import { JobFormDialogFooter } from '@/components/jobs/job-form-dialog-footer';
import { JOB_FORM_COPY } from '@/lib/ui/job-form-copy';

type EditJobFormProps = {
  jobId: string;
  /** List-cache job used as placeholder so fields are filled the moment the dialog opens */
  seedJob?: JobType;
  formLoading?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  standalone?: boolean;
};

function EditJobForm({
  jobId,
  seedJob,
  onSuccess,
  onCancel,
  standalone = true,
  formLoading = false,
}: EditJobFormProps) {
  const isRouteFallback = useIsRouteFallback();
  const { data } = useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getSingleJobAction(jobId),
    staleTime: 60_000,
    placeholderData: seedJob?.id === jobId ? seedJob : undefined,
    enabled: !isRouteFallback,
  });

  const form = useForm<CreateAndEditJobType>({
    resolver: zodResolver(createAndEditJobSchema),
    defaultValues: {
      position: '',
      company: '',
      location: '',
      status: JobStatus.Pending,
      mode: JobMode.FullTime,
      applyUrl: '',
    },
  });

  // Re-apply server data only when the record version changes: a same-version refetch must not
  // reset the form (reset clears submit state mid-validation and drops the save).
  // keepDirtyValues: a newer version fills untouched fields only — never overwrites what the user typed.
  const appliedVersion = useRef<string | null>(null);
  useEffect(() => {
    if (!data) return;
    const version = `${data.id}:${new Date(data.updatedAt).getTime()}`;
    if (appliedVersion.current === version) return;
    appliedVersion.current = version;
    form.reset(
      {
        position: data.position,
        company: data.company,
        location: data.location,
        status: data.status as JobStatus,
        mode: data.mode as JobMode,
        applyUrl: data.applyUrl ?? '',
      },
      { keepDirtyValues: true },
    );
  }, [data, form]);

  const { mutate, isPending } = useUpdateJobMutation(jobId);
  const fields = JOB_FORM_COPY.fields;
  // The dialog portals outside the fallback's `inert` wrapper, so the fallback must never show live fields
  const showFieldSkeleton = isRouteFallback || (formLoading && !data);
  const handleCancel = onCancel ?? (standalone ? () => form.reset() : undefined);

  function onSubmit(values: CreateAndEditJobType) {
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  const formBody = showFieldSkeleton ? (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 sm:px-6 sm:pt-6">
      <JobFormDialogHeader mode="edit" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-2xl" />
      </div>
    </div>
  ) : (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="overlay-scroll flex-1 overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-6">
          <JobFormDialogHeader mode="edit" />
          <div className="flex flex-col gap-4">
            <CustomFormField
              name="position"
              control={form.control}
              labelText={fields.position.label}
              labelIcon={fields.position.icon}
              labelIconClassName={fields.position.iconClass}
              required
            />
            <CustomFormField
              name="company"
              control={form.control}
              labelText={fields.company.label}
              labelIcon={fields.company.icon}
              labelIconClassName={fields.company.iconClass}
              required
            />
            <CustomFormField
              name="location"
              control={form.control}
              labelText={fields.location.label}
              labelIcon={fields.location.icon}
              labelIconClassName={fields.location.iconClass}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomFormFilterDropdown
                name="status"
                control={form.control}
                options={JOB_FORM_STATUS_OPTIONS}
                getOptionIcon={getJobStatusOptionIcon}
                labelText={fields.status.label}
                labelIcon={fields.status.icon}
                labelIconClassName={fields.status.iconClass}
                required
              />
              <CustomFormFilterDropdown
                name="mode"
                control={form.control}
                options={JOB_FORM_MODE_OPTIONS}
                getOptionIcon={getJobModeOptionIcon}
                labelText={fields.mode.label}
                labelIcon={fields.mode.icon}
                labelIconClassName={fields.mode.iconClass}
                required
              />
            </div>
            <CustomFormField
              name="applyUrl"
              control={form.control}
              labelText={fields.applyUrl.label}
              labelIcon={fields.applyUrl.icon}
              labelIconClassName={fields.applyUrl.iconClass}
              placeholder="https://jobs.lever.co/company/…"
            />
          </div>
        </div>
        <div className="shrink-0 px-4 pb-5 pt-2 sm:px-6">
          <JobFormDialogFooter
            mode="edit"
            isPending={isPending}
            onCancel={handleCancel}
          />
        </div>
      </form>
    </Form>
  );

  if (!standalone) return formBody;
  return <GlassCard variant="violet">{formBody}</GlassCard>;
}

export default EditJobForm;

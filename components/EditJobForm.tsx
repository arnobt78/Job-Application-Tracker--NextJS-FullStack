'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import {
  JobStatus,
  JobMode,
  createAndEditJobSchema,
  CreateAndEditJobType,
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
  formLoading?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  standalone?: boolean;
};

function EditJobForm({
  jobId,
  onSuccess,
  onCancel,
  standalone = true,
  formLoading = false,
}: EditJobFormProps) {
  const { data } = useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getSingleJobAction(jobId),
    staleTime: 60_000,
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

  useEffect(() => {
    if (data) {
      form.reset({
        position: data.position,
        company: data.company,
        location: data.location,
        status: data.status as JobStatus,
        mode: data.mode as JobMode,
        applyUrl: data.applyUrl ?? '',
      });
    }
  }, [data, form]);

  const { mutate, isPending } = useUpdateJobMutation(jobId);
  const fields = JOB_FORM_COPY.fields;
  const showFieldSkeleton = formLoading && !data;
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

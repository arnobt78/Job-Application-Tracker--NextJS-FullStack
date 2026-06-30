'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { useCreateJobMutation } from '@/hooks/useJobsMutation';
import { GlassCard } from '@/components/ui/glass-card';
import { JobFormDialogHeader } from '@/components/jobs/job-form-dialog-header';
import { JobFormDialogFooter } from '@/components/jobs/job-form-dialog-footer';
import { JOB_FORM_COPY } from '@/lib/ui/job-form-copy';

type CreateJobFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  standalone?: boolean;
};

function CreateJobForm({
  onSuccess,
  onCancel,
  standalone = true,
}: CreateJobFormProps) {
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

  const { mutate, isPending } = useCreateJobMutation();
  const fields = JOB_FORM_COPY.fields;

  function onSubmit(values: CreateAndEditJobType) {
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  const handleCancel = onCancel ?? (standalone ? () => form.reset() : undefined);

  const formBody = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="overlay-scroll flex-1 overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-6">
          <JobFormDialogHeader mode="create" />
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
            mode="create"
            isPending={isPending}
            onCancel={handleCancel}
          />
        </div>
      </form>
    </Form>
  );

  if (!standalone) return formBody;
  return <GlassCard variant="sky">{formBody}</GlassCard>;
}

export default CreateJobForm;

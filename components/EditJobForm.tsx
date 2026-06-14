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
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { CustomFormField, CustomFormSelect } from './FormComponents';
import { useQuery } from '@tanstack/react-query';
import { getSingleJobAction } from '@/utils/actions';
import { useUpdateJobMutation } from '@/hooks/useJobsMutation';
import { queryKeys } from '@/lib/query-keys';
import { GlassCard } from '@/components/ui/glass-card';
import { Pencil } from 'lucide-react';

type EditJobFormProps = {
  jobId: string;
  /**
   * Called after successful update.
   * Used by EditJobDialog to close the dialog after save.
   */
  onSuccess?: () => void;
  /**
   * When false, renders form content without outer GlassCard wrapper.
   * Set to false when composing inside EditJobDialog.
   */
  standalone?: boolean;
};

function EditJobForm({ jobId, onSuccess, standalone = true }: EditJobFormProps) {
  const { data } = useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getSingleJobAction(jobId),
  });

  const form = useForm<CreateAndEditJobType>({
    resolver: zodResolver(createAndEditJobSchema),
    defaultValues: {
      position: '',
      company: '',
      location: '',
      status: JobStatus.Pending,
      mode: JobMode.FullTime,
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
      });
    }
  }, [data, form]);

  const { mutate, isPending } = useUpdateJobMutation(jobId);

  function onSubmit(values: CreateAndEditJobType) {
    // Pass onSuccess as per-call callback — runs after hook-level onSuccess (toast + invalidation)
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="mb-6 flex items-center gap-2 text-4xl font-semibold capitalize">
          <Pencil className="h-8 w-8 text-violet-400" />
          Edit Job
        </h2>
        <div className="flex flex-col gap-4">
          <CustomFormField name="position" control={form.control} required />
          <CustomFormField name="company" control={form.control} required />
          <CustomFormField name="location" control={form.control} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomFormSelect
              name="status"
              control={form.control}
              labelText="job status"
              items={Object.values(JobStatus)}
              required
            />
            <CustomFormSelect
              name="mode"
              control={form.control}
              labelText="job mode"
              items={Object.values(JobMode)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full capitalize"
            disabled={isPending}
          >
            {isPending ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (!standalone) return formContent;
  return <GlassCard variant="violet">{formContent}</GlassCard>;
}

export default EditJobForm;

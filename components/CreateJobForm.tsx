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
import { Button } from './ui/button';
import { CustomFormField, CustomFormSelect } from './FormComponents';
import { useCreateJobMutation } from '@/hooks/useJobsMutation';
import { GlassCard } from '@/components/ui/glass-card';
import { PlusCircle } from 'lucide-react';

type CreateJobFormProps = {
  /**
   * Called after successful job creation.
   * Used by AddJobDialog to close the dialog after create.
   */
  onSuccess?: () => void;
  /**
   * When false, renders form content without outer GlassCard wrapper.
   * Set to false when composing inside AddJobDialog (dialog provides its own glass chrome).
   */
  standalone?: boolean;
};

function CreateJobForm({ onSuccess, standalone = true }: CreateJobFormProps) {
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

  const { mutate, isPending } = useCreateJobMutation();

  function onSubmit(values: CreateAndEditJobType) {
    // Pass onSuccess as per-call callback — runs after hook-level onSuccess (toast + invalidation)
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="mb-6 flex items-center gap-2 text-4xl font-semibold capitalize">
          <PlusCircle className="h-8 w-8 text-sky-400" />
          Add Job
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
            {isPending ? 'Creating...' : 'Create Job'}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (!standalone) return formContent;
  return <GlassCard variant="sky">{formContent}</GlassCard>;
}

export default CreateJobForm;

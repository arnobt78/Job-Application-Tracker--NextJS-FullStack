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

function CreateJobForm() {
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
    mutate(values);
  }

  return (
    <GlassCard variant="sky">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <h2 className="capitalize font-semibold text-4xl mb-6 flex items-center gap-2">
            <PlusCircle className="h-8 w-8 text-sky-400" />
            Add Job
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
            <CustomFormField name="position" control={form.control} />
            <CustomFormField name="company" control={form.control} />
            <CustomFormField name="location" control={form.control} />
            <CustomFormSelect
              name="status"
              control={form.control}
              labelText="job status"
              items={Object.values(JobStatus)}
            />
            <CustomFormSelect
              name="mode"
              control={form.control}
              labelText="job mode"
              items={Object.values(JobMode)}
            />
            <Button type="submit" className="self-end capitalize" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </Form>
    </GlassCard>
  );
}

export default CreateJobForm;

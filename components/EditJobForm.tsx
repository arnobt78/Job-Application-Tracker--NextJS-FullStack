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

function EditJobForm({ jobId }: { jobId: string }) {
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
    mutate(values);
  }

  return (
    <GlassCard variant="violet">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <h2 className="capitalize font-semibold text-4xl mb-6 flex items-center gap-2">
            <Pencil className="h-8 w-8 text-violet-400" />
            Edit Job
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
              {isPending ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </GlassCard>
  );
}

export default EditJobForm;

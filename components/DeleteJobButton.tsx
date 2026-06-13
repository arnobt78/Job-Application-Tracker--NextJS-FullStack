'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { GlassAlertDialog } from '@/components/ui/glass-alert-dialog';
import { useDeleteJobMutation } from '@/hooks/useJobsMutation';
import type { JobType } from '@/utils/types';

type DeleteJobBtnProps = {
  job: Pick<JobType, 'id' | 'position' | 'company'>;
};

function DeleteJobBtn({ job }: DeleteJobBtnProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useDeleteJobMutation(job.id);

  const handleConfirm = () => {
    mutate(undefined, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        className="gap-1"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>

      <GlassAlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="destructive"
        icon={<Trash2 className="h-6 w-6" />}
        title="Remove application?"
        description={`${job.position} at ${job.company}`}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmIcon={<Trash2 className="h-4 w-4" aria-hidden />}
        loading={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default DeleteJobBtn;

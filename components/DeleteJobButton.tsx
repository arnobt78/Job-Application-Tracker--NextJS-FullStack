'use client';

import { Button } from './ui/button';
import { useDeleteJobMutation } from '@/hooks/useJobsMutation';
import { Trash2 } from 'lucide-react';

function DeleteJobBtn({ id }: { id: string }) {
  const { mutate, isPending } = useDeleteJobMutation(id);

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      className="gap-1"
      onClick={() => mutate()}
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}

export default DeleteJobBtn;

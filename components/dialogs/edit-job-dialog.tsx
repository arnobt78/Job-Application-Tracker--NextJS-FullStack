'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassDialogContent } from '@/components/ui/glass-dialog-content';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAlertDialog } from '@/components/ui/glass-alert-dialog';
import { Button } from '@/components/ui/button';
import EditJobForm from '@/components/EditJobForm';
import type { JobType } from '@/utils/types';

type EditJobDialogProps = {
  job: Pick<JobType, 'id' | 'position' | 'company'>;
  /**
   * When true, renders an Edit trigger button.
   * When false, use defaultOpen={true} for URL-based access (e.g. /dashboard/[id]).
   */
  showTrigger?: boolean;
  /**
   * Pre-opens the dialog — used when navigating directly to /dashboard/[id].
   * Pair with onExternalClose to navigate away when dialog closes.
   */
  defaultOpen?: boolean;
  /**
   * Called when dialog closes in defaultOpen mode.
   * Typically used to navigate back to /dashboard.
   */
  onExternalClose?: () => void;
};

/**
 * Glassmorphic Edit Job dialog.
 * Two usage modes:
 *  1. showTrigger=true (JobCard): confirm alert → Edit dialog.
 *  2. defaultOpen=true (URL /dashboard/[id]): opens immediately; onExternalClose navigates back.
 */
export function EditJobDialog({
  job,
  showTrigger = false,
  defaultOpen = false,
  onExternalClose,
}: EditJobDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && !showTrigger) {
      onExternalClose?.();
    }
  };

  const handleConfirmEdit = () => {
    setConfirmOpen(false);
    setOpen(true);
  };

  return (
    <>
      {showTrigger && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setConfirmOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      )}

      {showTrigger && (
        <GlassAlertDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          variant="default"
          icon={<Pencil className="h-6 w-6" />}
          title="Edit application?"
          description={`${job.position} at ${job.company}`}
          cancelLabel="Cancel"
          confirmLabel="Edit"
          confirmIcon={<Pencil className="h-4 w-4" aria-hidden />}
          onConfirm={handleConfirmEdit}
        />
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <GlassDialogContent>
          <GlassCard variant="violet" className="flex h-full w-full flex-col overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Edit Job</DialogTitle>
            </DialogHeader>
            <div className="overlay-scroll min-h-0 flex-1 overflow-y-auto">
              <EditJobForm
                jobId={job.id}
                standalone={false}
                onSuccess={() => handleOpenChange(false)}
              />
            </div>
          </GlassCard>
        </GlassDialogContent>
      </Dialog>
    </>
  );
}

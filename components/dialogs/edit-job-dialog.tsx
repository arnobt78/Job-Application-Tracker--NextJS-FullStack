'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import EditJobForm from '@/components/EditJobForm';

type EditJobDialogProps = {
  jobId: string;
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
 *  1. showTrigger=true (JobCard): renders an Edit button trigger.
 *  2. defaultOpen=true (URL /dashboard/[id]): opens immediately; onExternalClose navigates back.
 */
export function EditJobDialog({
  jobId,
  showTrigger = false,
  defaultOpen = false,
  onExternalClose,
}: EditJobDialogProps) {
  const [open, setOpen] = useState(defaultOpen);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && !showTrigger) {
      // Dialog closed in URL-access mode — let caller navigate away
      onExternalClose?.();
    }
  };

  return (
    <>
      {showTrigger && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-[660px]">
          {/* GlassCard provides violet glassmorphic chrome; standalone=false skips inner card */}
          <GlassCard variant="violet" className="w-full">
            <DialogHeader className="sr-only">
              <DialogTitle>Edit Job</DialogTitle>
            </DialogHeader>
            <EditJobForm
              jobId={jobId}
              standalone={false}
              onSuccess={() => handleOpenChange(false)}
            />
          </GlassCard>
        </DialogContent>
      </Dialog>
    </>
  );
}

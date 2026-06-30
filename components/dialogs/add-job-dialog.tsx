'use client';

import { useState } from 'react';
import { FilePlus } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassDialogContent } from '@/components/ui/glass-dialog-content';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import CreateJobForm from '@/components/CreateJobForm';
import { DASHBOARD_COPY } from '@/lib/ui/dashboard-copy';
import { JOB_DIALOG_PANEL_CLASS } from '@/lib/ui/job-dialog-dimensions';

/**
 * Glassmorphic Add Job dialog with trigger button.
 * Form owns scroll + footer layout so button glow is not clipped.
 */
export function AddJobDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 rounded-full border border-primary/30 shadow-sm shadow-primary/20"
      >
        <FilePlus className="h-4 w-4" />
        {DASHBOARD_COPY.addJob.cta}
      </Button>

      <Dialog modal open={open} onOpenChange={setOpen}>
        <GlassDialogContent description="Add a new job application to your pipeline">
          <GlassCard variant="sky" className={JOB_DIALOG_PANEL_CLASS}>
            <DialogHeader className="sr-only">
              <DialogTitle>Add New Job</DialogTitle>
            </DialogHeader>
            <CreateJobForm
              standalone={false}
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </GlassCard>
        </GlassDialogContent>
      </Dialog>
    </>
  );
}

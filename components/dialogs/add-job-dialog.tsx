'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassDialogContent } from '@/components/ui/glass-dialog-content';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import CreateJobForm from '@/components/CreateJobForm';

/**
 * Glassmorphic Add Job dialog with trigger button.
 * Renders trigger inline; wraps CreateJobForm in Dialog + GlassCard chrome.
 * On successful create: dialog closes (handled via CreateJobForm onSuccess prop).
 */
export function AddJobDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 rounded-full border border-primary/30 shadow-sm shadow-primary/20"
      >
        <PlusCircle className="h-4 w-4" />
        Add Job
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <GlassDialogContent>
          <GlassCard variant="sky" className="flex h-full w-full flex-col overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Add New Job</DialogTitle>
            </DialogHeader>
            <div className="overlay-scroll min-h-0 flex-1 overflow-y-auto">
              <CreateJobForm standalone={false} onSuccess={() => setOpen(false)} />
            </div>
          </GlassCard>
        </GlassDialogContent>
      </Dialog>
    </>
  );
}

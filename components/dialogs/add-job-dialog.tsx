'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
        <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-[660px]">
          {/* GlassCard provides sky glassmorphic chrome; standalone=false skips inner card */}
          <GlassCard variant="sky" className="w-full">
            <DialogHeader className="sr-only">
              <DialogTitle>Add New Job</DialogTitle>
            </DialogHeader>
            <CreateJobForm standalone={false} onSuccess={() => setOpen(false)} />
          </GlassCard>
        </DialogContent>
      </Dialog>
    </>
  );
}

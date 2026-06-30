'use client';

import { FilePlus, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { JOB_FORM_COPY } from '@/lib/ui/job-form-copy';
import { cn } from '@/lib/utils';

type JobFormDialogFooterProps = {
  mode: 'create' | 'edit';
  isPending: boolean;
  /** When set, cancel calls this; otherwise uses DialogClose (inside dialog) */
  onCancel?: () => void;
  className?: string;
};

/** Sticky footer — cancel + submit bottom-right; glow not clipped by scroll body */
export function JobFormDialogFooter({
  mode,
  isPending,
  onCancel,
  className,
}: JobFormDialogFooterProps) {
  const { footer } = JOB_FORM_COPY;
  const submitLabel =
    mode === 'create' ? footer.submitCreate : footer.submitEdit;
  const pendingLabel =
    mode === 'create' ? footer.pendingCreate : footer.pendingEdit;
  const SubmitIcon = mode === 'create' ? FilePlus : Save;

  const cancelButton = (
    <Button
      type="button"
      variant="outline"
      className="h-10 min-w-[7rem] gap-2"
      disabled={isPending}
      onClick={onCancel}
    >
      <X className="h-4 w-4" aria-hidden />
      {footer.cancel}
    </Button>
  );

  return (
    <div
      className={cn(
        'flex justify-end gap-2 border-t border-white/10 pt-4',
        className
      )}
    >
      {onCancel ? (
        cancelButton
      ) : (
        <DialogClose asChild>{cancelButton}</DialogClose>
      )}
      <Button
        type="submit"
        className="h-10 min-w-[9rem] gap-2 shadow-sm shadow-primary/25"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <SubmitIcon className="h-4 w-4" aria-hidden />
        )}
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </div>
  );
}

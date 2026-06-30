import { FilePlus, Pencil } from 'lucide-react';
import { JOB_FORM_COPY } from '@/lib/ui/job-form-copy';
import { cn } from '@/lib/utils';

type JobFormDialogHeaderProps = {
  mode: 'create' | 'edit';
  className?: string;
};

/** Compact dialog header — icon left, title + subtitle (text-base), clears top-right close */
export function JobFormDialogHeader({ mode, className }: JobFormDialogHeaderProps) {
  const copy = mode === 'create' ? JOB_FORM_COPY.create : JOB_FORM_COPY.edit;
  const Icon = mode === 'create' ? FilePlus : Pencil;
  const iconBoxClass =
    mode === 'create'
      ? 'border-sky-400/30 bg-sky-500/15 text-sky-400'
      : 'border-violet-400/30 bg-violet-500/15 text-violet-400';

  return (
    <div className={cn('mb-5 flex gap-3 pr-10', className)}>
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
          iconBoxClass
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold leading-snug">{copy.title}</h2>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>
    </div>
  );
}

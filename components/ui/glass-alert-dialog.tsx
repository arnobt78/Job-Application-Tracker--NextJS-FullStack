'use client';

import type { ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type GlassAlertVariant = 'default' | 'destructive' | 'sky';

type GlassAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Leading icon on confirm button — replaced by spinner when loading */
  confirmIcon?: ReactNode;
  /** Leading icon on cancel button */
  cancelIcon?: ReactNode;
  onConfirm: () => void;
  loading?: boolean;
  variant?: GlassAlertVariant;
};

const glassVariantMap: Record<
  GlassAlertVariant,
  'sky' | 'rose' | 'violet'
> = {
  default: 'violet',
  destructive: 'rose',
  sky: 'sky',
};

/**
 * Glass confirm dialog — uses Dialog (modal=false) to avoid body scroll lock / layout shift.
 * Radix AlertDialog hardcodes modal=true; Dialog preserves alert UX without scrollbar hide.
 */
export function GlassAlertDialog({
  open,
  onOpenChange,
  icon,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmIcon,
  cancelIcon = <X className="h-4 w-4" aria-hidden />,
  onConfirm,
  loading = false,
  variant = 'default',
}: GlassAlertDialogProps) {
  const glassVariant = glassVariantMap[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-0 bg-transparent p-0 shadow-none sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <GlassCard variant={glassVariant} className="p-0">
          <div className="flex gap-4 p-6">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-background/40',
                variant === 'destructive' && 'text-rose-400',
                variant === 'sky' && 'text-sky-400',
                variant === 'default' && 'text-violet-400'
              )}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <DialogTitle className="text-left text-lg font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription className="text-left text-sm">
                {description}
              </DialogDescription>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 p-4 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" className="gap-2" disabled={loading}>
                {cancelIcon}
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              className="gap-2"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                confirmIcon
              )}
              {confirmLabel}
            </Button>
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
}

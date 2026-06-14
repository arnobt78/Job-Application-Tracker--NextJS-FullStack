'use client';

import * as React from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type GlassDialogContentProps = React.ComponentProps<typeof DialogContent>;

/** Job dialog shell — 90% viewport; inner GlassCard scrolls via overlay-scroll */
export function GlassDialogContent({
  className,
  children,
  ...props
}: GlassDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        'flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col overflow-hidden',
        'border-0 bg-transparent p-0 shadow-none',
        'translate-x-[-50%] translate-y-[-50%]',
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

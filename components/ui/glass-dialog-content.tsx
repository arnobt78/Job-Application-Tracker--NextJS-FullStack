'use client';

import * as React from 'react';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type GlassDialogContentProps = React.ComponentProps<typeof DialogContent> & {
  /** Screen-reader description — satisfies Radix a11y requirement */
  description?: string;
};

/**
 * Job dialog shell — transparent outer portal (glow not clipped);
 * close button sits inside the glass panel top-right.
 */
export function GlassDialogContent({
  className,
  children,
  description = 'Dialog content',
  ...props
}: GlassDialogContentProps) {
  return (
    <DialogContent
      showClose={false}
      className={cn(
        'w-auto max-w-none overflow-visible border-0 bg-transparent p-0 shadow-none',
        'translate-x-[-50%] translate-y-[-50%]',
        className
      )}
      {...props}
    >
      <DialogDescription className="sr-only">{description}</DialogDescription>
      <div className="relative">
        <DialogClose
          className={cn(
            'absolute right-5 top-5 z-50 rounded-full p-1',
            'opacity-70 ring-offset-background transition-opacity',
            'hover:bg-white/10 hover:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        {children}
      </div>
    </DialogContent>
  );
}

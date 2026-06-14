'use client';

import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/** Glass-styled dropdown panel — backdrop blur + sky glow */
export function GlassDropdownContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      className={cn(
        'min-w-[12rem] border-sky-400/20 bg-popover/95 p-1 shadow-[0_20px_50px_rgba(2,132,199,0.25)] backdrop-blur-md',
        className
      )}
      {...props}
    />
  );
}

/** Chevron for glass dropdown triggers — mirrors SelectTrigger icon slot */
export function GlassDropdownChevron({ className }: { className?: string }) {
  return (
    <ChevronDown
      className={cn('h-4 w-4 shrink-0 opacity-50', className)}
      aria-hidden
    />
  );
}

type GlassDropdownTriggerProps = ButtonProps;

/**
 * Shared glass dropdown trigger — left-aligned label slot + right chevron.
 * Overrides Button default justify-center so placeholder/label stays left.
 */
export const GlassDropdownTrigger = forwardRef<
  HTMLButtonElement,
  GlassDropdownTriggerProps
>(function GlassDropdownTrigger({ className, children, type = 'button', ...props }, ref) {
  return (
    <Button
      ref={ref}
      type={type}
      variant="outline"
      className={cn(
        'glass-input h-10 w-full justify-between gap-2 px-3 py-0 font-normal text-left',
        '[&>span]:line-clamp-none',
        className
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center justify-start text-left">
        {children}
      </span>
      <GlassDropdownChevron />
    </Button>
  );
});

type GlassDropdownRadioItemProps = React.ComponentProps<
  typeof DropdownMenuRadioItem
> & {
  icon?: ReactNode;
  /** Optional when custom `children` row content is provided (e.g. TestAccountSelectRow) */
  label?: string;
};

/** Radio item with icon + label; check indicator on the right */
export function GlassDropdownRadioItem({
  icon,
  label = '',
  className,
  children,
  ...props
}: GlassDropdownRadioItemProps) {
  return (
    <DropdownMenuRadioItem
      className={cn(
        'group relative flex cursor-pointer select-none items-center gap-2 rounded-xl py-2 pl-2 pr-8 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>span:first-child]:hidden',
        className
      )}
      {...props}
    >
      {children ? (
        /* Custom row (avatar + name/email) — single flex slot avoids empty label span stealing width */
        <span className="min-w-0 flex-1 pr-6">{children}</span>
      ) : (
        <>
          {icon ? (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
              {icon}
            </span>
          ) : null}
          <span className="flex-1 truncate">{label}</span>
        </>
      )}
      <Check
        className="absolute right-2 h-4 w-4 opacity-0 group-data-[state=checked]:opacity-100"
        aria-hidden
      />
    </DropdownMenuRadioItem>
  );
}

type GlassDropdownActionItemProps = React.ComponentProps<
  typeof DropdownMenuItem
> & {
  icon?: ReactNode;
  label: string;
};

/** Plain action row (e.g. Clear Selection) with optional icon */
export function GlassDropdownActionItem({
  icon,
  label,
  className,
  ...props
}: GlassDropdownActionItemProps) {
  return (
    <DropdownMenuItem
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-xl py-2 pl-2 pr-2 text-sm',
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </DropdownMenuItem>
  );
}

export function GlassDropdownSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      className={cn('my-1 bg-white/10', className)}
      {...props}
    />
  );
}

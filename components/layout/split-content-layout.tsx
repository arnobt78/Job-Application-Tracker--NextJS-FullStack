import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SplitContentLayoutProps = {
  leading: ReactNode;
  trailing: ReactNode;
  /** Form-first on mobile when true (auth pages) */
  reverseOnMobile?: boolean;
  minHeight?: string;
  className?: string;
};

/**
 * Fluid two-column layout — columns expand/squeeze with viewport; gap scales at md/lg/xl.
 * No fixed pixel column widths.
 */
export function SplitContentLayout({
  leading,
  trailing,
  reverseOnMobile = false,
  minHeight,
  className,
}: SplitContentLayoutProps) {
  const leadingOrder = reverseOnMobile ? 'order-2 md:order-1' : 'order-1';
  const trailingOrder = reverseOnMobile ? 'order-1 md:order-2' : 'order-2';

  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 items-center gap-8 sm:gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-12 lg:gap-16 xl:gap-20',
        minHeight,
        className
      )}
    >
      <div className={cn('min-w-0 w-full', leadingOrder)}>{leading}</div>
      <div className={cn('min-w-0 w-full', trailingOrder)}>{trailing}</div>
    </div>
  );
}

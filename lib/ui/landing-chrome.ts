import { cn } from '@/lib/utils';

/** Horizontal inset — navbar + footer (no vertical padding) */
export const LANDING_CHROME_WRAPPER_CLASS = 'px-2 sm:px-4';

/** Fixed 56px bar — flex center on Y axis, no py */
export const LANDING_CHROME_SHELL_CLASS = cn(
  'flex h-14 w-full items-center justify-between gap-4',
  'bg-transparent backdrop-blur-sm'
);

/** Navbar/footer outer height — matches shell */
export const LANDING_CHROME_HEIGHT_CLASS = 'h-14';

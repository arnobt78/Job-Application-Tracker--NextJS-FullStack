import { PageContainer } from '@/components/layout/page-container';
import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

type NavShellProps = PropsWithChildren<{ className?: string }>;

/**
 * Shared nav chrome — fixed h-14, glass backdrop-blur, z-50.
 * Server component (no hooks). LandingNav, AuthNav, DashboardNav all compose this.
 * Wraps PageContainer for consistent max-w-7xl content width.
 */
export function NavShell({ children, className }: NavShellProps) {
  return (
    <header
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-50 h-14 backdrop-blur-sm',
        className
      )}
    >
      <PageContainer
        as="div"
        className="pointer-events-auto flex h-full items-center justify-between gap-4 bg-transparent"
      >
        {children}
      </PageContainer>
    </header>
  );
}

import { DashboardNav } from '@/components/layout/dashboard-nav';
import { PageContainer } from '@/components/layout/page-container';
import { PropsWithChildren } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Dashboard layout — full-width top-nav only.
 * Sidebar removed; all nav links are in DashboardNav.
 * Content area starts below fixed h-14 navbar (pt-14 offset).
 */
function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-shell-overlay" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <DashboardNav />
        {/* pt clears the fixed h-14 navbar + extra breathing room */}
        <PageContainer className="flex-1 py-16 pt-[calc(3.5rem+2rem)]">
          {children}
        </PageContainer>
      </div>
    </div>
  );
}

export default DashboardLayout;

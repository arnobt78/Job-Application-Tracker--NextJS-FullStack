import { DashboardNav } from '@/components/layout/dashboard-nav';
import { PageContainer } from '@/components/layout/page-container';
import { NavUserProvider } from '@/context/nav-user-context';
import { navUserSnapshotFromClerk } from '@/lib/auth/nav-user';
import { currentUser } from '@clerk/nextjs/server';
import type { PropsWithChildren } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Dashboard layout — full-width top-nav only.
 * SSR-seeds Clerk user for navbar avatar (no skeleton flash on refresh).
 */
async function DashboardLayout({ children }: PropsWithChildren) {
  const initialNavUser = navUserSnapshotFromClerk(await currentUser());

  return (
    <NavUserProvider user={initialNavUser}>
      <div className="app-shell">
        <div className="app-shell-overlay" aria-hidden />
        <div className="relative z-10 flex min-h-screen flex-col">
          <DashboardNav />
          <PageContainer className="flex-1 py-16 pt-[calc(3.5rem+2rem)]">
            {children}
          </PageContainer>
        </div>
      </div>
    </NavUserProvider>
  );
}

export default DashboardLayout;

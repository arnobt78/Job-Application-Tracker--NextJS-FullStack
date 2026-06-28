import { DashboardNav } from '@/components/layout/dashboard-nav';
import { PageContainer } from '@/components/layout/page-container';
import { NavUserProvider } from '@/context/nav-user-context';
import { NotificationsProvider } from '@/context/notifications-context';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { navUserSnapshotFromSession } from '@/lib/auth/nav-user';
import { auth } from '@/auth';
import type { PropsWithChildren } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Dashboard layout — full-width top-nav only.
 * SSR-seeds NextAuth session user for navbar avatar (no skeleton flash on refresh).
 */
async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await auth();
  const initialNavUser = navUserSnapshotFromSession(session);

  return (
    <NavUserProvider user={initialNavUser}>
      <PostHogProvider>
      <NotificationsProvider>
      <div className="app-shell">
        <div className="app-shell-overlay" aria-hidden />
        <div className="relative z-10 flex min-h-screen flex-col">
          <DashboardNav />
          <PageContainer className="flex-1 py-16 pt-[calc(3.5rem+2rem)]">
            {children}
          </PageContainer>
        </div>
      </div>
      </NotificationsProvider>
      </PostHogProvider>
    </NavUserProvider>
  );
}

export default DashboardLayout;

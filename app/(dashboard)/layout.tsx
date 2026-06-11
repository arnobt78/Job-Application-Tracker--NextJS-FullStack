import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { PageContainer } from '@/components/layout/page-container';
import { PropsWithChildren } from 'react';

export const dynamic = 'force-dynamic';

function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-shell-overlay" aria-hidden />
      <main className="relative z-10 grid min-h-screen lg:grid-cols-5">
        <div className="glass-sidebar hidden min-h-screen lg:col-span-1 lg:block">
          <Sidebar />
        </div>
        <div className="flex min-h-screen flex-col lg:col-span-4">
          <Navbar />
          <PageContainer className="flex-1 py-16">{children}</PageContainer>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;

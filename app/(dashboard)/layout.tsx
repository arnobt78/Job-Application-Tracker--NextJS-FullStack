import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { PropsWithChildren } from 'react';

export const dynamic = 'force-dynamic';

function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-shell-overlay" aria-hidden />
      <main className="relative z-10 grid lg:grid-cols-5 min-h-screen">
        <div className="hidden lg:block lg:col-span-1 lg:min-h-screen glass-sidebar">
          <Sidebar />
        </div>
        <div className="lg:col-span-4 flex flex-col min-h-screen">
          <Navbar />
          <div className="py-16 px-4 sm:px-8 lg:px-16 flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;

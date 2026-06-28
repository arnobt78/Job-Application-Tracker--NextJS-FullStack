'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { OverlayScrollbar } from '@/components/ui/overlay-scrollbar';
import { QueryProvider } from '@/providers/query-provider';
import { SessionProvider } from 'next-auth/react';

/**
 * Global client-side providers.
 * SessionProvider: NextAuth session context — makes useSession() available everywhere.
 * Must wrap QueryProvider so TanStack Query hooks can read auth state if needed.
 */
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <OverlayScrollbar />
        <Toaster />
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;

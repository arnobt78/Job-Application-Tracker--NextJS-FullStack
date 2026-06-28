'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { isSentryEnabled } from '@/lib/sentry/config';

/** Syncs NextAuth session user context to Sentry for error attribution */
export function useSentryUser(): void {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!isSentryEnabled() || status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [status, session]);
}

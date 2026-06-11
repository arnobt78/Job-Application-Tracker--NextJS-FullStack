'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import * as Sentry from '@sentry/nextjs';
import { isSentryEnabled } from '@/lib/sentry/config';

/** Syncs Clerk user context to Sentry for error attribution */
export function useSentryUser(): void {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSentryEnabled() || !isLoaded) return;

    if (isSignedIn && user) {
      Sentry.setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [isLoaded, isSignedIn, user]);
}

'use client';

import {
  notifyGoodbye,
  notifyWelcome,
} from '@/lib/notifications/app-toast';
import {
  consumePendingGoodbyeName,
  consumePendingWelcomeName,
  consumeWelcomePending,
  firstNameFrom,
  hasPendingGoodbyeName,
  hasPendingWelcomeName,
  hasWelcomePending,
} from '@/lib/notifications/auth-toast-storage';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

function displayNameFromUser(user: NonNullable<ReturnType<typeof useUser>['user']>): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    'there'
  );
}

/** Defer toast until the destination route has painted */
function afterDestinationPaint(callback: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

/** Route-gated welcome/goodbye Sonner toasts after auth redirects */
export function AuthToastListener(): null {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const welcomeShown = useRef(false);
  const goodbyeShown = useRef(false);

  useEffect(() => {
    if (!pathname.startsWith('/dashboard')) return;
    if (welcomeShown.current) return;

    const credentialPending = hasPendingWelcomeName();
    const oauthPending = hasWelcomePending();

    if (!credentialPending && !oauthPending) return;

    // OAuth welcome needs Clerk user loaded for display name
    if (oauthPending && !credentialPending && (!isLoaded || !isSignedIn || !user)) {
      return;
    }

    afterDestinationPaint(() => {
      if (welcomeShown.current) return;

      const pendingName = consumePendingWelcomeName();
      if (pendingName) {
        welcomeShown.current = true;
        notifyWelcome(pendingName);
        return;
      }

      if (isLoaded && isSignedIn && user && consumeWelcomePending()) {
        welcomeShown.current = true;
        notifyWelcome(firstNameFrom(displayNameFromUser(user)));
      }
    });
  }, [pathname, isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (pathname !== '/') return;
    if (goodbyeShown.current) return;
    if (!hasPendingGoodbyeName()) return;

    let cancelled = false;
    // Brief delay so Clerk redirect + landing paint finish before toast (avoids flash/reload swallowing it)
    const timer = window.setTimeout(() => {
      afterDestinationPaint(() => {
        if (cancelled || goodbyeShown.current) return;

        const goodbye = consumePendingGoodbyeName();
        if (!goodbye) return;

        goodbyeShown.current = true;
        notifyGoodbye(goodbye);
      });
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}

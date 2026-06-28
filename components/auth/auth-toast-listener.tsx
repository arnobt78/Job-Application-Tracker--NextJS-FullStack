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
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

function displayNameFromUser(user: { name?: string | null; email?: string | null }): string {
  return (
    user.name ||
    user.email?.split('@')[0] ||
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
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';
  const isSignedIn = status === 'authenticated';
  const user = session?.user;
  const welcomeShown = useRef(false);
  const goodbyeShown = useRef(false);

  useEffect(() => {
    if (!pathname.startsWith('/dashboard')) return;
    if (welcomeShown.current) return;

    const credentialPending = hasPendingWelcomeName();
    const oauthPending = hasWelcomePending();

    if (!credentialPending && !oauthPending) return;

    // OAuth welcome needs session loaded for display name
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
    // Brief delay so redirect + landing paint finish before toast (avoids flash/reload swallowing it)
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

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
} from '@/lib/notifications/auth-toast-storage';
import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

function displayNameFromUser(user: NonNullable<ReturnType<typeof useUser>['user']>): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    'there'
  );
}

/** Fires welcome/goodbye Sonner toasts after auth redirects (sessionStorage flags) */
export function AuthToastListener(): null {
  const { isLoaded, isSignedIn, user } = useUser();
  const prevSignedIn = useRef<boolean | null>(null);

  useEffect(() => {
    const welcome = consumePendingWelcomeName();
    if (welcome) {
      notifyWelcome(welcome);
      return;
    }
    const goodbye = consumePendingGoodbyeName();
    if (goodbye) {
      notifyGoodbye(goodbye);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    if (consumeWelcomePending()) {
      notifyWelcome(firstNameFrom(displayNameFromUser(user)));
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!isLoaded) return;

    if (prevSignedIn.current === null) {
      prevSignedIn.current = isSignedIn;
      return;
    }

    if (!prevSignedIn.current && isSignedIn && user) {
      notifyWelcome(firstNameFrom(displayNameFromUser(user)));
    }

    prevSignedIn.current = isSignedIn;
  }, [isLoaded, isSignedIn, user]);

  return null;
}

'use client';

import { signIn } from 'next-auth/react';
import { useCallback, useState } from 'react';
import {
  notifyAuthError,
  scheduleWelcomeAfterRedirect,
} from '@/lib/notifications/app-toast';
import { TEST_ACCOUNTS } from '@/lib/auth/test-credentials';

/** NextAuth credential sign-in — shared by SignInForm and TryDemoAccountButton */
export function useGuestSignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithCredentials = useCallback(
    async (identifier: string, password: string) => {
      setIsLoading(true);
      try {
        const result = await signIn('credentials', {
          email: identifier,
          password,
          redirect: false,
        });

        if (result?.error) {
          notifyAuthError('Invalid email or password.');
          return false;
        }

        if (result?.ok) {
          const account = Object.values(TEST_ACCOUNTS).find(
            (a) => a.email === identifier
          );
          scheduleWelcomeAfterRedirect(account?.name ?? identifier.split('@')[0] ?? 'there');
          window.location.href = '/dashboard';
          return true;
        }

        notifyAuthError('Could not complete sign in. Please try again.');
        return false;
      } catch {
        notifyAuthError('Invalid email or password.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signInAsGuest = useCallback(async () => {
    const { email, password } = TEST_ACCOUNTS['guest-user'];
    await signInWithCredentials(email, password);
  }, [signInWithCredentials]);

  return { signInAsGuest, signInWithCredentials, isLoading, isReady: true };
}

'use client';

import { useSignIn } from '@clerk/nextjs';
import { useCallback, useState } from 'react';
import {
  notifyAuthError,
  scheduleWelcomeAfterRedirect,
} from '@/lib/notifications/app-toast';
import { TEST_ACCOUNTS } from '@/lib/auth/test-credentials';

/** Clerk credential sign-in — shared by SignInForm and TryDemoAccountButton */
export function useGuestSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithCredentials = useCallback(
    async (identifier: string, password: string) => {
      if (!isLoaded || !signIn || !setActive) return false;

      setIsLoading(true);
      try {
        const result = await signIn.create({ identifier, password });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          const account = Object.values(TEST_ACCOUNTS).find(
            (a) => a.email === identifier
          );
          scheduleWelcomeAfterRedirect(account?.name ?? identifier.split('@')[0] ?? 'there');
          window.location.href = '/dashboard';
          return true;
        }

        notifyAuthError('Could not complete sign in. Please try again.');
        setIsLoading(false);
        return false;
      } catch {
        notifyAuthError('Invalid email or password.');
        setIsLoading(false);
        return false;
      }
    },
    [isLoaded, signIn, setActive]
  );

  const signInAsGuest = useCallback(async () => {
    const { email, password } = TEST_ACCOUNTS['guest-user'];
    await signInWithCredentials(email, password);
  }, [signInWithCredentials]);

  return { signInAsGuest, signInWithCredentials, isLoading, isReady: isLoaded };
}

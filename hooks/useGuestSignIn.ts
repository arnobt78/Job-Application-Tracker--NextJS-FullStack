'use client';

import { useSignIn } from '@clerk/nextjs';
import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { TEST_ACCOUNTS } from '@/lib/auth/test-credentials';

/** Clerk credential sign-in — shared by SignInForm and TryDemoAccountButton */
export function useGuestSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithCredentials = useCallback(
    async (identifier: string, password: string) => {
      if (!isLoaded || !signIn || !setActive) return false;

      setIsLoading(true);
      try {
        const result = await signIn.create({ identifier, password });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          window.location.href = '/add-job';
          return true;
        }

        toast({
          variant: 'destructive',
          title: 'Could not complete sign in.',
        });
        return false;
      } catch {
        toast({
          variant: 'destructive',
          title: 'Invalid email or password.',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signIn, setActive, toast]
  );

  const signInAsGuest = useCallback(async () => {
    const { email, password } = TEST_ACCOUNTS['guest-user'];
    await signInWithCredentials(email, password);
  }, [signInWithCredentials]);

  return { signInAsGuest, signInWithCredentials, isLoading, isReady: isLoaded };
}

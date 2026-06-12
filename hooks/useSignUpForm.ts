'use client';

import { useSignUp } from '@clerk/nextjs';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  notifySignUpError,
  scheduleWelcomeAfterRedirect,
} from '@/lib/notifications/app-toast';

type SignUpFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** Clerk credential sign-up + optional email verification step */
export function useSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const completeSession = useCallback(
    async (sessionId: string | null, displayName: string) => {
      if (!sessionId || !setActive) return false;
      await setActive({ session: sessionId });
      scheduleWelcomeAfterRedirect(displayName);
      window.location.href = '/dashboard';
      return true;
    },
    [setActive]
  );

  const register = useCallback(
    async ({ firstName, lastName, email, password }: SignUpFields) => {
      if (!isLoaded || !signUp) return false;

      setIsLoading(true);
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      try {
        const result = await signUp.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          emailAddress: email.trim(),
          password,
        });

        if (result.status === 'complete') {
          return completeSession(result.createdSessionId, displayName);
        }

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
        toast.info('Check your email', {
          description: 'Enter the verification code we sent you.',
        });
        return true;
      } catch {
        notifySignUpError('Please check your details and try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [completeSession, isLoaded, signUp]
  );

  const verifyEmail = useCallback(
    async (code: string, displayName: string) => {
      if (!isLoaded || !signUp) return false;

      setIsLoading(true);
      try {
        const result = await signUp.attemptEmailAddressVerification({ code });

        if (result.status === 'complete') {
          return completeSession(result.createdSessionId, displayName);
        }

        notifySignUpError('Invalid verification code.');
        return false;
      } catch {
        notifySignUpError('Check the code and try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [completeSession, isLoaded, signUp]
  );

  return {
    register,
    verifyEmail,
    isLoading,
    isReady: isLoaded,
    pendingVerification,
  };
}

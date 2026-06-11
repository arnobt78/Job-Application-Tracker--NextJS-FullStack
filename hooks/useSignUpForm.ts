'use client';

import { useSignUp } from '@clerk/nextjs';
import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

type SignUpFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** Clerk credential sign-up + optional email verification step */
export function useSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const completeSession = useCallback(
    async (sessionId: string | null) => {
      if (!sessionId || !setActive) return false;
      await setActive({ session: sessionId });
      window.location.href = '/add-job';
      return true;
    },
    [setActive]
  );

  const register = useCallback(
    async ({ firstName, lastName, email, password }: SignUpFields) => {
      if (!isLoaded || !signUp) return false;

      setIsLoading(true);
      try {
        const result = await signUp.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          emailAddress: email.trim(),
          password,
        });

        if (result.status === 'complete') {
          return completeSession(result.createdSessionId);
        }

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
        toast({
          title: 'Check your email',
          description: 'Enter the verification code we sent you.',
        });
        return true;
      } catch {
        toast({
          variant: 'destructive',
          title: 'Could not create account.',
          description: 'Please check your details and try again.',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [completeSession, isLoaded, signUp, toast]
  );

  const verifyEmail = useCallback(
    async (code: string) => {
      if (!isLoaded || !signUp) return false;

      setIsLoading(true);
      try {
        const result = await signUp.attemptEmailAddressVerification({ code });

        if (result.status === 'complete') {
          return completeSession(result.createdSessionId);
        }

        toast({
          variant: 'destructive',
          title: 'Invalid verification code.',
        });
        return false;
      } catch {
        toast({
          variant: 'destructive',
          title: 'Verification failed.',
          description: 'Check the code and try again.',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [completeSession, isLoaded, signUp, toast]
  );

  return {
    register,
    verifyEmail,
    isLoading,
    isReady: isLoaded,
    pendingVerification,
  };
}

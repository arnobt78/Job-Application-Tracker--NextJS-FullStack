'use client';

import { signIn } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  notifySignUpError,
  scheduleWelcomeAfterRedirect,
} from '@/lib/notifications/app-toast';
import { createUserAction } from '@/utils/actions';

type SignUpFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/**
 * NextAuth credential sign-up:
 *   1. createUserAction() — creates User row in DB with bcrypt-hashed password
 *   2. signIn('credentials') — issues NextAuth JWT session immediately
 *   3. Redirect to /dashboard
 *
 * No email verification step (pendingVerification always false for API compatibility).
 */
export function useSignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback(
    async ({ firstName, lastName, email, password }: SignUpFields) => {
      setIsLoading(true);
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      try {
        // Create user in DB
        const result = await createUserAction(displayName, email.trim(), password);
        if (!result.success) {
          notifySignUpError(result.error ?? 'Registration failed. Please try again.');
          return false;
        }

        // Sign in immediately after account creation
        const signInResult = await signIn('credentials', {
          email: email.trim(),
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error('Account created', {
            description: 'Sign-in failed — please sign in manually.',
          });
          return false;
        }

        scheduleWelcomeAfterRedirect(firstName.trim() || displayName);
        window.location.href = '/dashboard';
        return true;
      } catch {
        notifySignUpError('Please check your details and try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Email verification not required with NextAuth credentials — kept for interface compatibility
  const verifyEmail = useCallback(async (_code: string, _displayName: string) => {
    return false;
  }, []);

  return {
    register,
    verifyEmail,
    isLoading,
    isReady: true,
    pendingVerification: false,
  };
}

'use client';

import { AuthSignInLeadingPanel } from '@/components/auth/auth-sign-in-leading-panel';
import SignInForm from '@/components/SignInForm';
import { AuthNav } from '@/components/layout/auth-nav';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SplitContentLayout } from '@/components/layout/split-content-layout';
import { useGuestSignIn } from '@/hooks/useGuestSignIn';
import {
  TEST_ACCOUNTS,
  type TestAccount,
  type TestAccountRole,
} from '@/lib/auth/test-credentials';
import { useCallback, useMemo, useState } from 'react';

type SignInPageShellProps = {
  isGuest?: boolean;
};

/** Client shell — shared sign-in state between left preview and right form */
export function SignInPageShell({ isGuest = false }: SignInPageShellProps) {
  const { signInWithCredentials, isLoading, isReady } = useGuestSignIn();
  const guestAccount = TEST_ACCOUNTS['guest-user'];
  const [selectedRole, setSelectedRole] = useState<TestAccountRole | ''>(
    isGuest ? 'guest-user' : ''
  );

  const selectedAccount = useMemo((): TestAccount | null => {
    if (!selectedRole) return null;
    return TEST_ACCOUNTS[selectedRole] ?? null;
  }, [selectedRole]);

  const handleAccountChange = useCallback((role: TestAccountRole | '') => {
    setSelectedRole(role);
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <AuthNav />
      <PageContainer className="flex-1 pb-12 pt-[calc(3.5rem+1.5rem)]">
        <SplitContentLayout
          reverseOnMobile
          minHeight="min-h-[calc(100vh-14rem)]"
          leading={
            <AuthSignInLeadingPanel selectedAccount={selectedAccount} />
          }
          trailing={
            <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
              <SignInForm
                isGuest={isGuest}
                isReady={isReady}
                isLoading={isLoading}
                selectedRole={selectedRole}
                onAccountChange={handleAccountChange}
                signInWithCredentials={signInWithCredentials}
                guestAccount={guestAccount}
              />
            </div>
          }
        />
      </PageContainer>
      <SiteFooter />
    </div>
  );
}

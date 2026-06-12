'use client';

import SignInForm from '@/components/SignInForm';
import { AuthMarketingPanel } from '@/components/layout/auth-marketing-panel';
import { AuthNav } from '@/components/layout/auth-nav';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SplitContentLayout } from '@/components/layout/split-content-layout';

type SignInPageContentProps = {
  isGuest?: boolean;
};

/** Auth layout — AuthNav top, marketing copy left, form right; pt-14 clears fixed navbar */
export function SignInPageContent({ isGuest = false }: SignInPageContentProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* AuthNav: logo + ThemeToggle + Return Home — fixed h-14 */}
      <AuthNav />

      <PageContainer className="flex-1 pb-12 pt-[calc(3.5rem+1.5rem)]">
        <SplitContentLayout
          reverseOnMobile
          minHeight="min-h-[calc(100vh-14rem)]"
          leading={<AuthMarketingPanel variant="sign-in" />}
          trailing={
            <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
              <SignInForm isGuest={isGuest} />
            </div>
          }
        />
      </PageContainer>

      <SiteFooter />
    </div>
  );
}

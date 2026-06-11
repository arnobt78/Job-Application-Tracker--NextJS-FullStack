'use client';

import SignUpForm from '@/components/SignUpForm';
import { AuthMarketingPanel } from '@/components/layout/auth-marketing-panel';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLogo } from '@/components/layout/site-logo';
import { SplitContentLayout } from '@/components/layout/split-content-layout';

/** Auth layout — marketing copy left, form right; no JPG backgrounds */
export function SignUpPageContent() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <PageContainer className="py-6">
        <SiteLogo priority />
      </PageContainer>

      <PageContainer className="flex-1 pb-12">
        <SplitContentLayout
          reverseOnMobile
          minHeight="min-h-[calc(100vh-14rem)]"
          leading={<AuthMarketingPanel variant="sign-up" />}
          trailing={
            <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
              <SignUpForm />
            </div>
          }
        />
      </PageContainer>

      <SiteFooter />
    </div>
  );
}

'use client';

import SignUpWrapper from '@/components/SignUpWrapper';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLogo } from '@/components/layout/site-logo';
import { SafeImage } from '@/components/ui/safe-image';

/** Auth layout — CSR Clerk sign-up; SSR metadata stays in app/sign-up/page.tsx */
export function SignUpPageContent() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <PageContainer className="py-6">
        <SiteLogo priority />
      </PageContainer>

      <PageContainer className="grid w-full flex-1 items-center gap-10 pb-16 sm:grid-cols-2 lg:-mt-16 lg:grid-cols-[1fr,400px]">
        <SafeImage
          src="/main.svg"
          alt="Jobify illustration"
          className="mx-auto hidden w-full max-w-[400px] sm:block"
          width={400}
          height={400}
        />
        <div className="flex w-full justify-center">
          <SignUpWrapper />
        </div>
      </PageContainer>

      <SiteFooter />
    </div>
  );
}

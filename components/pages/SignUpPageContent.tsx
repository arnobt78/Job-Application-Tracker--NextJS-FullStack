'use client';

import SignUpWrapper from '@/components/SignUpWrapper';
import { AuthMarketingPanel } from '@/components/layout/auth-marketing-panel';
import { MarketingBackground } from '@/components/layout/marketing-background';
import { MarketingVisualPanel } from '@/components/layout/marketing-visual-panel';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLogo } from '@/components/layout/site-logo';
import { SplitContentLayout } from '@/components/layout/split-content-layout';
import { getMarketingAssets } from '@/lib/ui/marketing-assets';

const signUpAssets = getMarketingAssets('sign-up');

/** Auth layout — fluid split; form first on mobile */
export function SignUpPageContent() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <MarketingBackground src={signUpAssets.background} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <PageContainer className="py-6">
          <SiteLogo priority />
        </PageContainer>

        <PageContainer className="flex-1 pb-12">
          <SplitContentLayout
            reverseOnMobile
            minHeight="min-h-[calc(100vh-14rem)]"
            leading={
              <div className="flex w-full flex-col gap-8">
                <AuthMarketingPanel variant="sign-up" />
                <MarketingVisualPanel
                  src={signUpAssets.panel}
                  alt="Join Jobify job tracker illustration"
                  accentSrc={signUpAssets.accent}
                  className="hidden md:block"
                />
              </div>
            }
            trailing={
              <div className="mx-auto flex w-full max-w-md justify-center md:mx-0 md:max-w-none">
                <SignUpWrapper />
              </div>
            }
          />
        </PageContainer>

        <SiteFooter />
      </div>
    </div>
  );
}

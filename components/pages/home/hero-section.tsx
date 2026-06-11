'use client';

import { TryDemoAccountButton } from '@/components/TryDemoAccountButton';
import { HeroIllustrationFrame } from '@/components/layout/hero-illustration-frame';
import { PageContainer } from '@/components/layout/page-container';
import { SiteLogo } from '@/components/layout/site-logo';
import { SplitContentLayout } from '@/components/layout/split-content-layout';
import { RippleLink } from '@/components/ui/ripple-link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { MARKETING_COPY } from '@/lib/ui/marketing-copy';
import { Rocket } from 'lucide-react';

const copy = MARKETING_COPY.hero;

/** Hero — fluid split; copy left, glass SVG frame right (same bg as other sections) */
export function HeroSection() {
  return (
    <section className="relative z-10 py-12 sm:py-20">
      <PageContainer>
        <header className="pb-8">
          <SiteLogo priority />
        </header>

        <SplitContentLayout
          minHeight="min-h-[calc(100vh-14rem)]"
          leading={
            <div className="flex w-full flex-col">
              <ScrollReveal delay={0}>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">
                  {copy.eyebrow}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <h1 className="mt-4 text-4xl font-bold capitalize sm:text-5xl lg:text-7xl">
                  {copy.titleLead}{' '}
                  <span className="text-primary">{copy.titleHighlight}</span>{' '}
                  {copy.titleTail}
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={240}>
                <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
                  {copy.body}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={360}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className="cta-shine-wrap inline-block rounded-full">
                    <RippleLink
                      href="/add-job"
                      className="cta-shine-button gap-2 rounded-full px-8"
                    >
                      <Rocket className="h-4 w-4" />
                      Get Started
                    </RippleLink>
                  </div>
                  <TryDemoAccountButton />
                </div>
              </ScrollReveal>
            </div>
          }
          trailing={
            <ScrollReveal delay={200} className="w-full">
              <HeroIllustrationFrame />
            </ScrollReveal>
          }
        />
      </PageContainer>
    </section>
  );
}

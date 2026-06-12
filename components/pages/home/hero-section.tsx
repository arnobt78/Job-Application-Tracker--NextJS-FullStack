'use client';

import { TryDemoAccountButton } from '@/components/TryDemoAccountButton';
import { HeroVisualCarousel } from '@/components/layout/hero-visual-carousel';
import { PageContainer } from '@/components/layout/page-container';
import { SplitContentLayout } from '@/components/layout/split-content-layout';
import { ScrollParallaxSection } from '@/components/ui/scroll-parallax-section';
import { ScrollStagger } from '@/components/ui/scroll-stagger';
import { RippleLink } from '@/components/ui/ripple-link';
import { HERO_CTA_CLASS } from '@/lib/ui/marketing-assets';
import { MARKETING_COPY } from '@/lib/ui/marketing-copy';
import { Rocket } from 'lucide-react';

const copy = MARKETING_COPY.hero;

/** Hero — each line + CTA staggers in when section enters viewport */
export function HeroSection() {
  return (
    <ScrollParallaxSection id="hero" className="min-h-screen">
      <PageContainer className="flex min-h-screen flex-col justify-center pb-12 pt-14">
        <SplitContentLayout
          leading={
            <ScrollStagger staggerMs={110} className="flex w-full flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">
                {copy.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-bold capitalize sm:text-5xl lg:text-7xl">
                {copy.titleLead}{' '}
                <span className="text-primary">{copy.titleHighlight}</span>{' '}
                {copy.titleTail}
              </h1>
              <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
                {copy.body}
              </p>
              <ScrollStagger
                staggerMs={100}
                className="mt-8 flex flex-wrap items-stretch gap-4"
              >
                <div className="cta-shine-wrap cta-shine-wrap--delay-a rounded-full">
                  <RippleLink href="/dashboard" className={HERO_CTA_CLASS}>
                    <Rocket className="h-4 w-4 shrink-0" />
                    Get Started
                  </RippleLink>
                </div>
                <TryDemoAccountButton shineDelay="b" />
              </ScrollStagger>
            </ScrollStagger>
          }
          trailing={
            <ScrollStagger staggerMs={120} className="w-full">
              <HeroVisualCarousel />
            </ScrollStagger>
          }
        />
      </PageContainer>
    </ScrollParallaxSection>
  );
}

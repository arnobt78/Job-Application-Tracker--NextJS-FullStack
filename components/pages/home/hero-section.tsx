'use client';

import { MarketingBackground } from '@/components/layout/marketing-background';
import { MarketingVisualPanel } from '@/components/layout/marketing-visual-panel';
import { PageContainer } from '@/components/layout/page-container';
import { SiteLogo } from '@/components/layout/site-logo';
import { SplitContentLayout } from '@/components/layout/split-content-layout';
import { RippleLink } from '@/components/ui/ripple-link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { getMarketingAssets } from '@/lib/ui/marketing-assets';
import { Rocket } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

const heroAssets = getMarketingAssets('hero');

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Hero — blurred JPG bg + fluid split; copy left, glass panel right */
export function HeroSection() {
  const [parallaxY, setParallaxY] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );

  useEffect(() => {
    if (reduceMotion) return;
    const onScroll = () => setParallaxY(window.scrollY * 0.06);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduceMotion]);

  return (
    <section className="relative z-10 min-h-[calc(100vh-6rem)] overflow-hidden">
      <MarketingBackground src={heroAssets.background} />

      <div className="relative z-10">
        <PageContainer>
          <header className="py-4">
            <SiteLogo priority />
          </header>
        </PageContainer>

        <PageContainer className="pb-16 pt-4">
          <SplitContentLayout
            minHeight="min-h-[calc(100vh-12rem)]"
            leading={
              <div className="flex w-full flex-col">
                <ScrollReveal delay={0}>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">
                    Job search, organized
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={120}>
                  <h1 className="mt-4 text-4xl font-bold capitalize sm:text-5xl lg:text-7xl">
                    job <span className="text-primary">tracking</span> app
                  </h1>
                </ScrollReveal>
                <ScrollReveal delay={240}>
                  <p className="mt-6 max-w-2xl text-justify leading-relaxed text-muted-foreground">
                    <strong className="text-foreground/90">Jobify</strong> is a
                    modern job application tracker for organizing, filtering, and
                    analyzing your search. Built with Next.js, TypeScript, Clerk,
                    Prisma, and PostgreSQL — with instant updates across every
                    screen.
                  </p>
                </ScrollReveal>
                <ScrollReveal delay={360}>
                  <div className="cta-shine-wrap mt-8 inline-block rounded-full">
                    <RippleLink
                      href="/add-job"
                      className="cta-shine-button gap-2 rounded-full px-8"
                    >
                      <Rocket className="h-4 w-4" />
                      Get Started
                    </RippleLink>
                  </div>
                </ScrollReveal>
              </div>
            }
            trailing={
              <ScrollReveal delay={200} className="w-full">
                <MarketingVisualPanel
                  src={heroAssets.panel}
                  alt="Job search and career tracking illustration"
                  accentSrc={heroAssets.accent}
                  priority
                  style={
                    reduceMotion
                      ? undefined
                      : { transform: `translateY(${parallaxY}px)` }
                  }
                />
              </ScrollReveal>
            }
          />
        </PageContainer>
      </div>
    </section>
  );
}

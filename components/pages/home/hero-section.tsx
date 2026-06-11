'use client';

import { PageContainer } from '@/components/layout/page-container';
import { SiteLogo } from '@/components/layout/site-logo';
import { RippleLink } from '@/components/ui/ripple-link';
import { SafeImage } from '@/components/ui/safe-image';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Hero — headline, CTA with ripple + shine, parallax illustration */
export function HeroSection() {
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => setParallaxY(window.scrollY * 0.08);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative z-10 pb-16 pt-6">
      <PageContainer>
        <header className="py-4">
          <SiteLogo priority />
        </header>
      </PageContainer>

      <PageContainer className="grid w-full items-center gap-10 sm:grid-cols-2 lg:min-h-[calc(100vh-8rem)] lg:grid-cols-[1fr,380px]">
        <div className="flex flex-col w-full">
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
              <strong className="text-foreground/90">Jobify</strong> is a modern
              job application tracker for organizing, filtering, and analyzing
              your search. Built with Next.js, TypeScript, Clerk, Prisma, and
              PostgreSQL — with instant updates across every screen.
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

        <ScrollReveal delay={200} className="hidden sm:block">
          <div
            className="mx-auto w-full max-w-[380px] transition-transform duration-100 ease-out"
            style={{ transform: `translateY(${parallaxY}px)` }}
          >
            <SafeImage
              src="/main.svg"
              alt="Jobify dashboard illustration"
              width={380}
              height={380}
              className="w-full h-auto"
              priority
            />
          </div>
        </ScrollReveal>
      </PageContainer>
    </section>
  );
}

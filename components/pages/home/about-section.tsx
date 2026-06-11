'use client';

import { PageContainer } from '@/components/layout/page-container';
import { RippleLink } from '@/components/ui/ripple-link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { MARKETING_COPY } from '@/lib/ui/marketing-copy';

const copy = MARKETING_COPY.about;

/** About + secondary CTA */
export function AboutSection() {
  return (
    <section className="relative z-10 py-20">
      <PageContainer className="grid w-full gap-10 sm:grid-cols-2 sm:items-center">
        <ScrollReveal>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {copy.heading}{' '}
            <span className="text-primary">{copy.headingHighlight}</span>
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{copy.body1}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{copy.body2}</p>
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <div className="rounded-[28px] border border-white/10 bg-background/40 p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/90">
              {copy.ctaEyebrow}
            </p>
            <p className="mt-4 text-xl font-semibold text-foreground/90">
              {copy.ctaTitle}
            </p>
            <div className="cta-shine-wrap mt-6 inline-block rounded-full">
              <RippleLink
                href="/sign-up"
                variant="secondary"
                className="cta-shine-button rounded-full px-8"
              >
                Create free account
              </RippleLink>
            </div>
          </div>
        </ScrollReveal>
      </PageContainer>
    </section>
  );
}

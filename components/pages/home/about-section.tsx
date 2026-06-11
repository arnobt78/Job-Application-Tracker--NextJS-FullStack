'use client';

import { PageContainer } from '@/components/layout/page-container';
import { RippleLink } from '@/components/ui/ripple-link';
import { ScrollParallaxSection } from '@/components/ui/scroll-parallax-section';
import { ScrollStagger } from '@/components/ui/scroll-stagger';
import { MARKETING_COPY } from '@/lib/ui/marketing-copy';

const copy = MARKETING_COPY.about;

/** About — brighter text for readability on dark shell */
export function AboutSection() {
  return (
    <ScrollParallaxSection id="about" className="relative z-10 py-20">
      <PageContainer className="grid w-full gap-10 sm:grid-cols-2 sm:items-center">
        <ScrollStagger staggerMs={110}>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {copy.heading}{' '}
            <span className="text-primary">{copy.headingHighlight}</span>
          </h2>
          <p className="mt-4 leading-relaxed text-foreground/85">{copy.body1}</p>
          <p className="mt-4 leading-relaxed text-foreground/85">{copy.body2}</p>
        </ScrollStagger>

        <div className="rounded-[28px] border border-white/15 bg-background/70 p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
          <ScrollStagger staggerMs={90}>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              {copy.ctaEyebrow}
            </p>
            <p className="mt-4 text-xl font-semibold text-foreground">
              {copy.ctaTitle}
            </p>
            <div className="mt-6 inline-block rounded-full">
              <RippleLink
                href="/sign-up"
                variant="secondary"
                className="rounded-full px-8"
              >
                Create free account
              </RippleLink>
            </div>
          </ScrollStagger>
        </div>
      </PageContainer>
    </ScrollParallaxSection>
  );
}

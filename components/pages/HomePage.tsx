'use client';

import { SiteFooter } from '@/components/layout/site-footer';
import { AboutSection } from '@/components/pages/home/about-section';
import { FeaturesSection } from '@/components/pages/home/features-section';
import { HeroSection } from '@/components/pages/home/hero-section';
import { StatsPromoSection } from '@/components/pages/home/stats-promo-section';

/** Landing page client shell — sections with scroll reveal; SSR metadata in app/page.tsx */
export default function HomePage() {
  return (
    <main className="relative z-10">
      <HeroSection />
      <StatsPromoSection />
      <FeaturesSection />
      <AboutSection />
      <SiteFooter />
    </main>
  );
}

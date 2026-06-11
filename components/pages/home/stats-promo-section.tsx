'use client';

import { PageContainer } from '@/components/layout/page-container';
import { GlassCard } from '@/components/ui/glass-card';
import { SafeImage } from '@/components/ui/safe-image';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StaggerGroup } from '@/components/ui/stagger-group';
import { MARKETING_ASSETS } from '@/lib/ui/marketing-assets';
import {
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

const PROMO_STATS = [
  {
    title: 'Real-time sync',
    description: 'SSE + Redis Streams keep every tab in sync without refresh.',
    icon: RefreshCw,
    accent: MARKETING_ASSETS.accents[0],
    variant: 'sky' as const,
  },
  {
    title: 'Analytics charts',
    description: 'Visualize pending, interview, and declined applications.',
    icon: BarChart3,
    accent: MARKETING_ASSETS.accents[1],
    variant: 'violet' as const,
  },
  {
    title: 'Export CSV / Excel',
    description: 'Download your full job history in one click.',
    icon: FileSpreadsheet,
    accent: MARKETING_ASSETS.accents[2],
    variant: 'emerald' as const,
  },
  {
    title: 'Secure auth',
    description: 'Clerk-powered sign-in with protected dashboard routes.',
    icon: ShieldCheck,
    accent: MARKETING_ASSETS.accents[3],
    variant: 'amber' as const,
  },
];

/** Static promotional highlights — no DB on public landing */
export function StatsPromoSection() {
  return (
    <section className="relative z-10 py-20">
      <PageContainer>
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Built for a <span className="text-primary">serious</span> job search
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Everything you need to stay organized — from first application to
            final offer.
          </p>
        </ScrollReveal>

        <StaggerGroup
          staggerMs={140}
          className="mt-12 grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PROMO_STATS.map((item) => (
            <GlassCard key={item.title} variant={item.variant}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <item.icon className="h-8 w-8 shrink-0 text-white/90" />
                <SafeImage
                  src={item.accent}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 object-contain opacity-90"
                  aria-hidden
                />
              </div>
              <h3 className="text-lg font-semibold text-white/90">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70">{item.description}</p>
            </GlassCard>
          ))}
        </StaggerGroup>
      </PageContainer>
    </section>
  );
}

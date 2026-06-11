'use client';

import { PageContainer } from '@/components/layout/page-container';
import { GlassCard } from '@/components/ui/glass-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StaggerGroup } from '@/components/ui/stagger-group';
import {
  Filter,
  Layers,
  LineChart,
  PencilLine,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Full CRUD pipeline',
    body: 'Create, edit, and delete jobs with optimistic UI — changes appear instantly everywhere.',
    icon: PencilLine,
    variant: 'sky' as const,
  },
  {
    title: 'Smart filters',
    body: 'Search by company or role and filter by status without losing your place.',
    icon: Filter,
    variant: 'violet' as const,
  },
  {
    title: 'Stats dashboard',
    body: 'Track pending, interviews, and declines with glass stat cards and live counts.',
    icon: Layers,
    variant: 'emerald' as const,
  },
  {
    title: 'Chart insights',
    body: 'Monthly application trends help you spot momentum in your search.',
    icon: LineChart,
    variant: 'amber' as const,
  },
  {
    title: 'Instant invalidation',
    body: 'Mutations bust SSR cache, React Query, BroadcastChannel, and SSE in one flow.',
    icon: Zap,
    variant: 'rose' as const,
  },
];

/** Feature grid — glass cards, stagger reveal */
export function FeaturesSection() {
  return (
    <section className="relative z-10 py-20">
      <PageContainer>
        <ScrollReveal>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Features that <span className="text-primary">move fast</span>
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            SSR prefetch plus client cache means pages feel instant. CRUD
            operations propagate across tabs and instances without reload.
          </p>
        </ScrollReveal>

        <StaggerGroup
          staggerMs={100}
          className="mt-12 grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <GlassCard key={feature.title} variant={feature.variant}>
              <feature.icon className="mb-3 h-7 w-7 text-white/90" />
              <h3 className="text-lg font-semibold text-white/90">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {feature.body}
              </p>
            </GlassCard>
          ))}
        </StaggerGroup>
      </PageContainer>
    </section>
  );
}

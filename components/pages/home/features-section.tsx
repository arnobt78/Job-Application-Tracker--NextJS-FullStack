"use client";

import { PageContainer } from "@/components/layout/page-container";
import { GlassCard, type GlassVariant } from "@/components/ui/glass-card";
import { ScrollParallaxSection } from "@/components/ui/scroll-parallax-section";
import { ScrollStagger } from "@/components/ui/scroll-stagger";
import { StaggerGroup } from "@/components/ui/stagger-group";
import { MARKETING_COPY } from "@/lib/ui/marketing-copy";
import { Filter, Layers, LineChart, PencilLine, Zap } from "lucide-react";

const FEATURE_ICONS = [PencilLine, Filter, Layers, LineChart, Zap] as const;
const FEATURE_VARIANTS: GlassVariant[] = [
  "sky",
  "violet",
  "emerald",
  "amber",
  "rose",
];
const copy = MARKETING_COPY.features;

/** Features — heading lines then cards stagger on viewport enter */
export function FeaturesSection() {
  return (
    <ScrollParallaxSection id="features" className="relative z-10 py-20">
      <PageContainer>
        <ScrollStagger staggerMs={100} className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {copy.heading}{" "}
            <span className="text-primary">{copy.headingHighlight}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {copy.subheading}
          </p>
        </ScrollStagger>

        <StaggerGroup
          staggerMs={110}
          className="mt-12 grid w-full gap-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {copy.cards.map((feature, index) => {
            const Icon = FEATURE_ICONS[index];
            const variant = FEATURE_VARIANTS[index];
            return (
              <GlassCard key={feature.title} variant={variant}>
                <Icon className="mb-3 h-7 w-7 text-white/90" />
                <h3 className="text-lg font-semibold text-white/90">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {feature.body}
                </p>
              </GlassCard>
            );
          })}
        </StaggerGroup>
      </PageContainer>
    </ScrollParallaxSection>
  );
}

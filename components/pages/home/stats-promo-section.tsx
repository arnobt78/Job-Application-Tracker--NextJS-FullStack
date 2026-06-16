"use client";

import { PageContainer } from "@/components/layout/page-container";
import { GlassCard, type GlassVariant } from "@/components/ui/glass-card";
import { ScrollParallaxSection } from "@/components/ui/scroll-parallax-section";
import { ScrollStagger } from "@/components/ui/scroll-stagger";
import { StaggerGroup } from "@/components/ui/stagger-group";
import { MARKETING_COPY } from "@/lib/ui/marketing-copy";
import {
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const PROMO_ICONS = [
  RefreshCw,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
] as const;
const PROMO_VARIANTS: GlassVariant[] = ["sky", "violet", "emerald", "amber"];
const copy = MARKETING_COPY.stats;

/** Highlights — heading lines then cards stagger on viewport enter */
export function StatsPromoSection() {
  return (
    <ScrollParallaxSection id="highlights" className="relative z-10 py-20">
      <PageContainer>
        <ScrollStagger staggerMs={100} className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {copy.heading}{" "}
            <span className="text-primary">{copy.headingHighlight}</span>{" "}
            {copy.headingTail}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {copy.subheading}
          </p>
        </ScrollStagger>

        <StaggerGroup
          staggerMs={130}
          className="mt-12 grid w-full gap-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {copy.cards.map((item, index) => {
            const Icon = PROMO_ICONS[index];
            const variant = PROMO_VARIANTS[index];
            return (
              <GlassCard key={item.title} variant={variant}>
                <Icon className="mb-3 h-8 w-8 text-white/90" />
                <h3 className="text-lg font-semibold text-white/90">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </GlassCard>
            );
          })}
        </StaggerGroup>
      </PageContainer>
    </ScrollParallaxSection>
  );
}

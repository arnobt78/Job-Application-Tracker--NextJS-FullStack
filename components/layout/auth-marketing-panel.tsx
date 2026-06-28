import { GlassCard } from "@/components/ui/glass-card";
import { MARKETING_COPY } from "@/lib/ui/marketing-copy";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Filter, RefreshCw, ShieldCheck } from "lucide-react";

type AuthVariant = "sign-in" | "sign-up";

const AUTH_FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: RefreshCw, label: "Real-time sync" },
  { icon: Filter, label: "Smart filters" },
  { icon: BarChart3, label: "Analytics charts" },
  { icon: ShieldCheck, label: "Secure NextAuth" },
];

type AuthMarketingPanelProps = {
  variant: AuthVariant;
  className?: string;
};

/** Static left-column copy for auth pages — no images */
export function AuthMarketingPanel({
  variant,
  className,
}: AuthMarketingPanelProps) {
  const copy = MARKETING_COPY[variant];

  return (
    <div className={cn("flex flex-col gap-4 sm:p-6", className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-xl sm:text-2xl font-semibold">
          {copy.title} <span className="text-primary">{copy.highlight}</span>
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          {copy.body}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {AUTH_FEATURES.map((feature) => (
          <GlassCard key={feature.label} variant="neutral" className="p-4">
            <div className="flex items-center gap-3">
              <feature.icon className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground/90">
                {feature.label}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

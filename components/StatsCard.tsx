import type { ReactNode } from "react";
import { Skeleton } from "./ui/skeleton";
import { GlassCard, type GlassVariant } from "@/components/ui/glass-card";
import { Clock, CalendarCheck, XCircle } from "lucide-react";

type StatsCardsProps = {
  title: string;
  value: number;
  variant?: GlassVariant;
  isLoading?: boolean;
};

const statIcons: Record<string, ReactNode> = {
  "pending jobs": <Clock className="h-6 w-6 text-amber-400" />,
  "interviews set": <CalendarCheck className="h-6 w-6 text-emerald-400" />,
  "jobs declined": <XCircle className="h-6 w-6 text-rose-400" />,
};

function StatsCards({
  title,
  value,
  variant = "sky",
  isLoading = false,
}: StatsCardsProps) {
  return (
    <GlassCard variant={variant}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground flex items-center gap-2">
            {statIcons[title]}
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export default StatsCards;

/**
 * StatsKpiCards — derived rate KPI cards, rendered inside StatsContainer's shared grid.
 *
 * Derived from StatsResult (same queryKeys.stats.all query — no extra DB call):
 *   - Response rate = (interview + declined) / total × 100  (positive responses)
 *   - Success rate  = interview / total × 100               (converted to interview)
 *   - Most active type = whichever of fullTime/partTime/internship is highest
 */

import type { ReactNode } from 'react';
import type { StatsResult } from '@/lib/jobs/queries';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Briefcase } from 'lucide-react';

type KpiCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  isLoading: boolean;
};

function KpiCard({ icon, label, value, isLoading }: KpiCardProps) {
  return (
    <GlassCard variant="neutral" className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-glass-fill">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-16" />
        ) : (
          <p className="mt-0.5 text-2xl font-semibold tabular-nums">{value}</p>
        )}
      </div>
    </GlassCard>
  );
}

type StatsKpiCardsProps = {
  stats: StatsResult | undefined;
  isLoading: boolean;
};

/** Fragment of 3 cards — parent grid controls columns so all 6 stat cards flow together */
export function StatsKpiCards({ stats, isLoading }: StatsKpiCardsProps) {
  const total = stats?.total ?? 0;
  const interview = stats?.interview ?? 0;
  const declined = stats?.declined ?? 0;
  const fullTime = stats?.fullTime ?? 0;
  const partTime = stats?.partTime ?? 0;
  const internship = stats?.internship ?? 0;

  const responseRate =
    total > 0 ? Math.round(((interview + declined) / total) * 100) : 0;

  const successRate =
    total > 0 ? Math.round((interview / total) * 100) : 0;

  const modeMax = Math.max(fullTime, partTime, internship);
  const activeType =
    modeMax === 0
      ? '—'
      : fullTime === modeMax
        ? 'Full-time'
        : partTime === modeMax
          ? 'Part-time'
          : 'Internship';

  return (
    <>
      <KpiCard
        icon={<TrendingUp className="h-5 w-5 text-sky-500 dark:text-sky-400" />}
        label="Response Rate"
        value={`${responseRate}%`}
        isLoading={isLoading}
      />
      <KpiCard
        icon={<Target className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />}
        label="Interview Rate"
        value={`${successRate}%`}
        isLoading={isLoading}
      />
      <KpiCard
        icon={<Briefcase className="h-5 w-5 text-violet-500 dark:text-violet-400" />}
        label="Top Job Type"
        value={activeType}
        isLoading={isLoading}
      />
    </>
  );
}

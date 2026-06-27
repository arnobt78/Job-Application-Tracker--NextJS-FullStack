'use client';

/**
 * StatsKpiRow — derived rate KPI cards below the main stats cards.
 *
 * Derived from StatsResult (same queryKeys.stats.all query — no extra DB call):
 *   - Response rate = (interview + declined) / total × 100  (positive responses)
 *   - Success rate  = interview / total × 100               (converted to interview)
 *   - Most active type = whichever of fullTime/partTime/internship is highest
 */

import { useQuery } from '@tanstack/react-query';
import { getStatsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Briefcase } from 'lucide-react';

type KpiCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLoading: boolean;
};

function KpiCard({ icon, label, value, isLoading }: KpiCardProps) {
  return (
    <GlassCard variant="neutral" className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
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

export function StatsKpiRow() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
    staleTime: 60_000,
  });
  const bodyLoading = useQueryBodyLoading(queryKeys.stats.all, isLoading);

  const total = data?.total ?? 0;
  const interview = data?.interview ?? 0;
  const declined = data?.declined ?? 0;
  const fullTime = data?.fullTime ?? 0;
  const partTime = data?.partTime ?? 0;
  const internship = data?.internship ?? 0;

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
    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        icon={<TrendingUp className="h-5 w-5 text-sky-400" />}
        label="Response Rate"
        value={`${responseRate}%`}
        isLoading={bodyLoading}
      />
      <KpiCard
        icon={<Target className="h-5 w-5 text-emerald-400" />}
        label="Interview Rate"
        value={`${successRate}%`}
        isLoading={bodyLoading}
      />
      <KpiCard
        icon={<Briefcase className="h-5 w-5 text-violet-400" />}
        label="Top Job Type"
        value={activeType}
        isLoading={bodyLoading}
      />
    </div>
  );
}

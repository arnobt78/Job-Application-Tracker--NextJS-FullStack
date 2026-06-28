'use client';

/**
 * SalaryIntelligence — aggregated salary data from the user's Bluedoor-enriched jobs.
 * Uses queryKeys.salaryIntel() — invalidated on job CRUD via invalidateAllJobQueries.
 * NOT persisted in localStorage (changes when jobs are enriched).
 */

import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import { getSalaryIntelligenceAction } from '@/utils/actions';
import type { SalaryIntelResult } from '@/utils/types';

function formatSalary(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/20 bg-black/20 px-4 py-3">
      <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
    </div>
  );
}

/** Horizontal bar for a role row */
function RoleBar({
  role,
  currency,
  globalMax,
}: {
  role: SalaryIntelResult['byRole'][number];
  currency: string;
  globalMax: number;
}) {
  const widthPct = globalMax > 0 ? Math.round((role.avgMax / globalMax) * 100) : 0;
  const minFmt = role.avgMin > 0 ? formatSalary(role.avgMin, currency) : null;
  const maxFmt = formatSalary(role.avgMax, currency);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="max-w-[55%] truncate font-medium" title={role.position}>
          {role.position}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {minFmt ? `${minFmt} – ${maxFmt}` : maxFmt}
          <span className="ml-1 text-muted-foreground/50">({role.count})</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-emerald-500/60 transition-all"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

export function SalaryIntelligence() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.salaryIntel(),
    queryFn: () => getSalaryIntelligenceAction(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <DollarSign className="h-6 w-6 animate-pulse" />
          <p className="text-xs">Loading salary data…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-4 text-center text-xs text-rose-400">
        Failed to load salary intelligence. Try refreshing the page.
      </p>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <DollarSign className="h-7 w-7 text-muted-foreground/30" />
        <div>
          <p className="text-sm font-medium">No salary data yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Salary ranges appear here once Bluedoor enriches your jobs. Add apply links to jobs to trigger enrichment.
          </p>
        </div>
      </div>
    );
  }

  const { count, total, avgMin, avgMax, currency, byRole } = data;
  const coveragePct = total > 0 ? Math.round((count / total) * 100) : 0;
  const globalMax = byRole[0]?.avgMax ?? avgMax;

  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          label="Avg Salary Range"
          value={avgMin > 0 ? `${formatSalary(avgMin, currency)} – ${formatSalary(avgMax, currency)}` : formatSalary(avgMax, currency)}
          sub={currency}
        />
        <KpiCard
          label="Jobs with Salary"
          value={count.toString()}
          sub={`${coveragePct}% of ${total} tracked`}
        />
        <KpiCard
          label="Avg Max Salary"
          value={formatSalary(avgMax, currency)}
          sub="ceiling across enriched jobs"
        />
      </div>

      {/* Role breakdown */}
      {byRole.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Salary by Role
          </div>
          <div className="flex flex-col gap-3">
            {byRole.map((role) => (
              <RoleBar key={role.position} role={role} currency={currency} globalMax={globalMax} />
            ))}
          </div>
        </div>
      )}

      <p className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
        <Briefcase className="h-3 w-3" />
        Data sourced from Bluedoor-enriched job postings only
      </p>
    </div>
  );
}

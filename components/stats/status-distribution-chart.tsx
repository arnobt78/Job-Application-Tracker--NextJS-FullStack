'use client';

/**
 * StatusDistributionChart — Donut chart showing pending / interview / declined breakdown.
 *
 * Data source: getStatsAction() (same query as StatsContainer — no extra DB call).
 * Follows ChartsContainer pattern: useQueryBodyLoading, skeleton only on chart area.
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getStatsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Interview: '#10b981',
  Declined: '#f43f5e',
} as const;

export function StatusDistributionChart() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
    staleTime: 60_000,
  });
  const bodyLoading = useQueryBodyLoading(queryKeys.stats.all, isLoading);

  if (bodyLoading) {
    return <Skeleton className="h-[280px] w-full rounded-2xl" />;
  }

  if (!data || data.total === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No application data yet.
      </p>
    );
  }

  const chartData = [
    { name: 'Pending', value: data.pending },
    { name: 'Interview', value: data.interview },
    { name: 'Declined', value: data.declined },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) =>
            percent > 0.05 ? `${Math.round(percent * 100)}%` : ''
          }
          labelLine={false}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          }}
          formatter={(value: number) => [value, '']}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

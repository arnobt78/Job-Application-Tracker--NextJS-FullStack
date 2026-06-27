'use client';

/**
 * ModeDistributionChart — Horizontal bar chart showing fullTime / partTime / internship breakdown.
 *
 * Data source: getStatsAction() (same query as StatsContainer — no extra DB call).
 * Follows ChartsContainer pattern: useQueryBodyLoading, skeleton only on chart area.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getStatsAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { Skeleton } from '@/components/ui/skeleton';

const MODE_COLORS = ['#2563eb', '#f59e0b', '#a855f7'];

export function ModeDistributionChart() {
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
    { name: 'Full-time', value: data.fullTime },
    { name: 'Part-time', value: data.partTime },
    { name: 'Internship', value: data.internship },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 10, right: 24, bottom: 0, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={72}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          }}
        />
        <Bar dataKey="value" name="Count" radius={[0, 8, 8, 0]} barSize={32}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={MODE_COLORS[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

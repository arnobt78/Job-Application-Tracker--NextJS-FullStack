'use client';

/**
 * WeeklyVelocityChart — Area chart showing weekly application count over the last 12 weeks.
 *
 * Data source: getWeeklyChartsDataAction() (getCachedWeeklyCharts).
 * Follows ChartsContainer pattern: useQueryBodyLoading, skeleton only on chart area.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getWeeklyChartsDataAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { Skeleton } from '@/components/ui/skeleton';

export function WeeklyVelocityChart() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.chartsWeekly.all,
    queryFn: () => getWeeklyChartsDataAction(),
    staleTime: 60_000,
  });
  const bodyLoading = useQueryBodyLoading(queryKeys.chartsWeekly.all, isLoading);

  if (bodyLoading) {
    return <Skeleton className="h-[280px] w-full rounded-2xl" />;
  }

  const hasData = data && data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No weekly data yet. Track applications to see your velocity.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10 }}
          interval={1}
          angle={-30}
          textAnchor="end"
          height={40}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          }}
          labelStyle={{ fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Applications"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#velocityGrad)"
          dot={{ fill: '#7c3aed', r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

'use client';

/**
 * ApplicationTrendChart — Monthly application trend with a 2-month projection line.
 *
 * Uses existing getChartsDataAction() (last 6 months). The projection is a simple
 * 3-month moving average added as a ReferenceLine/projected point so the user can
 * see if their application pace is trending up or down.
 *
 * Follows ChartsContainer pattern: useQueryBodyLoading, skeleton only on chart area.
 */

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getChartsDataAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import { Skeleton } from '@/components/ui/skeleton';

type DataPoint = { date: string; count: number; projected?: number };

/** Compute a 1-month linear projection appended to the data */
function withProjection(data: Array<{ date: string; count: number }>): DataPoint[] {
  if (data.length < 3) return data;
  const last3 = data.slice(-3).map((d) => d.count);
  const avg = Math.round(last3.reduce((a, b) => a + b, 0) / last3.length);
  return [...data, { date: 'Projected', count: 0, projected: avg }];
}

export function ApplicationTrendChart() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.charts.all,
    queryFn: () => getChartsDataAction(),
    staleTime: 60_000,
  });
  const bodyLoading = useQueryBodyLoading(queryKeys.charts.all, isLoading);

  if (bodyLoading) {
    return <Skeleton className="h-[300px] w-full rounded-2xl" />;
  }

  if (!data || data.length < 1) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No application data yet. Start tracking to see your trend.
      </p>
    );
  }

  const chartData = withProjection(data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="count"
          name="Applications"
          fill="#2563eb"
          barSize={60}
          radius={[8, 8, 0, 0]}
        />
        <Line
          dataKey="projected"
          name="Projected"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={{ fill: '#f59e0b', r: 4 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

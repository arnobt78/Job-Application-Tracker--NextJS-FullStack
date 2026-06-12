'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getChartsDataAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { Skeleton } from './ui/skeleton';

/** Chart body only — heading lives in stats page.tsx */
function ChartsContainer() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.charts.all,
    queryFn: () => getChartsDataAction(),
  });

  if (isPending) {
    return <Skeleton className="h-[300px] w-full rounded-2xl" />;
  }

  if (!data || data.length < 1) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No application data yet for this period.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#2563eb" barSize={75} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ChartsContainer;

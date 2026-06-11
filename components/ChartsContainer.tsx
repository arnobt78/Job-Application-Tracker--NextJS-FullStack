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
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from './ui/skeleton';
import { BarChart3 } from 'lucide-react';

function ChartsContainer() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.charts.all,
    queryFn: () => getChartsDataAction(),
  });

  if (isPending) {
    return <Skeleton className="mt-16 h-[300px] w-full rounded-[28px]" />;
  }

  if (!data || data.length < 1) return null;

  return (
    <GlassCard variant="sky" className="mt-16">
      <h1 className="text-4xl font-semibold text-center flex items-center justify-center gap-2 mb-8">
        <BarChart3 className="h-8 w-8 text-sky-400" />
        Monthly Applications
      </h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" barSize={75} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

export default ChartsContainer;

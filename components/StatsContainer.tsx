'use client';

import { useQuery } from '@tanstack/react-query';
import { getStatsAction } from '@/utils/actions';
import StatsCard, { StatsLoadingCard } from './StatsCard';
import { queryKeys } from '@/lib/query-keys';

function StatsContainer() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
  });

  if (isPending) {
    return (
      <div className="grid md:grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsLoadingCard />
        <StatsLoadingCard />
        <StatsLoadingCard />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 lg:grid-cols-3">
      <StatsCard title="pending jobs" value={data?.pending || 0} variant="amber" />
      <StatsCard title="interviews set" value={data?.interview || 0} variant="emerald" />
      <StatsCard title="jobs declined" value={data?.declined || 0} variant="rose" />
    </div>
  );
}

export default StatsContainer;

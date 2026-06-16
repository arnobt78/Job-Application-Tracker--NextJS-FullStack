'use client';

import { useQuery } from '@tanstack/react-query';
import { getStatsAction } from '@/utils/actions';
import StatsCard from './StatsCard';
import { queryKeys } from '@/lib/query-keys';
import { useQueryBodyLoading } from '@/lib/query-body-loading';
import type { GlassVariant } from '@/components/ui/glass-card';

const STAT_ITEMS: Array<{
  title: string;
  variant: GlassVariant;
  key: 'pending' | 'interview' | 'declined';
}> = [
  { title: 'pending jobs', variant: 'amber', key: 'pending' },
  { title: 'interviews set', variant: 'emerald', key: 'interview' },
  { title: 'jobs declined', variant: 'rose', key: 'declined' },
];

function StatsContainer() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => getStatsAction(),
    staleTime: 60_000,
  });
  const bodyLoading = useQueryBodyLoading(queryKeys.stats.all, isLoading);

  return (
    <div className="grid md:grid-cols-2 gap-4 lg:grid-cols-3">
      {STAT_ITEMS.map(({ title, variant, key }) => (
        <StatsCard
          key={title}
          title={title}
          variant={variant}
          value={data?.[key] ?? 0}
          isLoading={bodyLoading}
        />
      ))}
    </div>
  );
}

export default StatsContainer;

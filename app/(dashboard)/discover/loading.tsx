import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Briefcase, ExternalLink, PlusCircle } from 'lucide-react';

/** Next.js streaming loading UI — shown while DiscoverPage SSR prefetch resolves */
export default function DiscoverLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header skeleton — mirrors DiscoverPageHeader */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-7 rounded-lg" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-xl" />
        </div>
      </div>

      {/* Filter section header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-6 w-32 rounded-xl" />
      </div>

      {/* Filter bar skeleton — matches GlassCard sky with 4-col grid */}
      <GlassCard variant="sky">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-10 rounded-xl sm:col-span-2 lg:col-span-1" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </GlassCard>

      {/* Results toolbar skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-6 w-32 rounded-xl" />
        <Skeleton className="h-6 w-10 rounded-full" />
      </div>

      {/* Results grid skeleton — static card shells */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} variant="neutral" className="flex flex-col gap-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                  <Skeleton className="h-4 w-40" />
                </h3>
                <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="mt-auto flex items-center gap-2">
              <Button size="sm" variant="outline" disabled className="h-8 gap-1.5 text-xs">
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
              <Button size="sm" variant="default" disabled className="ml-auto h-8 gap-1.5 text-xs">
                <PlusCircle className="h-3.5 w-3.5" />
                Track Application
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

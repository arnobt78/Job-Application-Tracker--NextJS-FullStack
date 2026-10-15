import { TimelineView } from '@/components/timeline/timeline-view';
import { GlassCard } from '@/components/ui/glass-card';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { Clock } from 'lucide-react';

/** /timeline layout — rendered by page.tsx (hydrated) and loading.tsx (instant shell, cache-only queries) */
export function TimelinePageView() {
  return (
    <>
      <div className="mb-6">
        <PageSectionHeader
          icon={Clock}
          title="Activity Timeline"
          subtitle="Chronological feed of all job application events"
          headingLevel="h1"
        />
      </div>

      {/* Two-column layout: timeline on left, legend on right (lg+) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
        {/* Main timeline */}
        <GlassCard variant="neutral" className="min-w-0">
          <TimelineView />
        </GlassCard>

        {/* Legend sidebar */}
        <div className="flex flex-col gap-4">
          <GlassCard variant="sky">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-text">
              Event types
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-ink-sky">
                  +
                </span>
                Application added
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-ink-amber">
                  ⚡
                </span>
                Linked to posting
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-ink-rose">
                  ↺
                </span>
                Posting changed
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-ink-violet">
                  ✦
                </span>
                AI insights generated
              </li>
            </ul>
          </GlassCard>

          <GlassCard variant="neutral">
            <p className="text-xs text-muted-foreground">
              Timeline updates automatically when you add jobs, and when a linked posting changes.
            </p>
          </GlassCard>
        </div>
      </div>
    </>
  );
}

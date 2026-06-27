'use client';

import { useState } from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiInsightsPanel } from '@/components/jobs/ai-insights-panel';
import { PostingActivityTab } from '@/components/jobs/posting-activity-tab';
import type { PipelineJobInput } from '@/lib/ai/pipeline-client';

type Tab = 'ai' | 'activity';

type JobDetailPanelsProps = {
  job: PipelineJobInput;
  /** Bluedoor job ID — only present when the job has been enriched */
  bluedoorJobId: string | null;
};

/**
 * Tab panel rendered below EditJobForm in /dashboard/[id].
 * Shows AI Insights tab always; Posting Activity tab only when bluedoorJobId is set.
 */
export function JobDetailPanels({ job, bluedoorJobId }: JobDetailPanelsProps) {
  const [active, setActive] = useState<Tab>('ai');

  const tabs: { key: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    {
      key: 'ai',
      label: 'AI Insights',
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    {
      key: 'activity',
      label: 'Posting Activity',
      icon: <Activity className="h-3.5 w-3.5" />,
      disabled: !bluedoorJobId,
    },
  ];

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border/30 bg-black/10 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border/30 bg-black/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => setActive(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors select-none',
              'border-b-2 -mb-px',
              active === tab.key
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5',
              tab.disabled && 'opacity-30 cursor-not-allowed pointer-events-none'
            )}
            title={tab.disabled ? 'Only available for Bluedoor-enriched jobs' : undefined}
          >
            {tab.icon}
            {tab.label}
            {tab.disabled && (
              <span className="ml-1 rounded-full bg-muted/30 px-1.5 py-0.5 text-[10px] font-normal leading-none">
                Not linked
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="p-4">
        {active === 'ai' && <AiInsightsPanel job={job} />}
        {active === 'activity' && bluedoorJobId && (
          <PostingActivityTab bluedoorJobId={bluedoorJobId} />
        )}
      </div>
    </div>
  );
}

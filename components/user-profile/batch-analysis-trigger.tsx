'use client';

/**
 * BatchAnalysisTrigger — "Analyse All Jobs" button.
 *
 * Enqueues background AI analysis for all jobs that don't yet have insights.
 * Uses ARQ queue via POST /api/ai/batch — non-blocking for the user.
 */

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIBatch } from '@/hooks/useAIBatch';

export function BatchAnalysisTrigger() {
  const { mutate, isPending } = useAIBatch();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-violet-300">Bulk AI Analysis</h3>
      <p className="text-xs text-muted-foreground">
        Queue AI fit scores and summaries for all unanalysed jobs. Results appear on job cards as they complete.
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => mutate(undefined)}
        className="mt-1 w-full gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {isPending ? 'Queuing…' : 'Analyse All Jobs'}
      </Button>
    </div>
  );
}

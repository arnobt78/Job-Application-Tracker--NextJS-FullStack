'use client';

/**
 * useAIBatch — mutation to enqueue bulk AI analysis for all unanalysed jobs.
 *
 * Calls POST /api/ai/batch → FastAPI /enqueue (ARQ).
 * Shows toast on success/error. Exported for use from BatchAnalysisTrigger.
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type BatchResult = {
  enqueued: number;
  taskIds: string[];
};

async function triggerBatchAnalysis(jobIds?: string[]): Promise<BatchResult> {
  const res = await fetch('/api/ai/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobIds ? { jobIds } : {}),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<BatchResult>;
}

export function useAIBatch() {
  return useMutation<BatchResult, Error, string[] | undefined>({
    mutationFn: triggerBatchAnalysis,
    onSuccess(data) {
      if (data.enqueued === 0) {
        toast.info('No jobs to analyse', {
          description: 'All your jobs already have AI insights.',
          duration: 4000,
        });
      } else {
        toast.success(`Analysis queued for ${data.enqueued} job${data.enqueued !== 1 ? 's' : ''}`, {
          description: 'AI insights will appear on your job cards as they complete.',
          duration: 5000,
        });
      }
    },
    onError(err) {
      toast.error('Queue unavailable', {
        description: err.message ?? 'Could not reach the AI service. Try again later.',
        duration: 5000,
      });
    },
  });
}

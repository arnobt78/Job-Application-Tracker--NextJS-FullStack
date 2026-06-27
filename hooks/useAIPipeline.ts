'use client';

/**
 * useAIPipeline — TanStack Query mutation for running the AI pipeline.
 *
 * Uses useMutation (not useQuery) because:
 *   - LLM calls are expensive; should only run on user action
 *   - Results are not cached across sessions (fresh LLM output per run)
 *
 * Calls POST /api/ai/pipeline (Next.js proxy → Python AI service).
 */

import { useMutation } from '@tanstack/react-query';
import type { PipelineRequest, PipelineResponse } from '@/lib/ai/pipeline-client';

async function fetchPipeline(payload: PipelineRequest): Promise<PipelineResponse> {
  const res = await fetch('/api/ai/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<PipelineResponse>;
}

export function useAIPipeline() {
  return useMutation<PipelineResponse, Error, PipelineRequest>({
    mutationFn: fetchPipeline,
  });
}

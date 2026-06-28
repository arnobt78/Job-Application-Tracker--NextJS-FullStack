'use client';

/**
 * useAIPipeline — TanStack Query mutation for running the AI pipeline.
 *
 * Two modes:
 *   1. Batch (useMutation): POST /api/ai/pipeline — single JSON response (fallback/non-streaming).
 *   2. Streaming (useStreamPipeline): POST /api/ai/pipeline/stream — SSE, emits per-agent progress.
 *
 * Streaming is the primary path. Batch is kept as a fallback.
 */

import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { PipelineRequest, PipelineResponse } from '@/lib/ai/pipeline-client';

// ─────────────────────────────────────────────
// Batch (non-streaming) mutation — fallback
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// SSE streaming progress state
// ─────────────────────────────────────────────

type StreamProgress = {
  currentStep: string | null;
  completedSteps: string[];
};

type StreamCallbacks = {
  onProgress?: (progress: StreamProgress) => void;
  onSuccess: (result: PipelineResponse) => void;
  onError: (message: string) => void;
};

/** Parse a single SSE line (e.g. "data: {...}") and return the parsed JSON or null */
function parseSseLine(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data: ')) return null;
  try {
    return JSON.parse(trimmed.slice(6)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * useStreamPipeline — streams per-agent progress from /api/ai/pipeline/stream.
 *
 * Returns { stream, isPending, progress, abort }.
 * Call stream(request, callbacks) to start a run.
 * Call abort() to cancel mid-run.
 */
export function useStreamPipeline() {
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState<StreamProgress>({ currentStep: null, completedSteps: [] });
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsPending(false);
    setProgress({ currentStep: null, completedSteps: [] });
  }, []);

  const stream = useCallback(
    async (payload: PipelineRequest, callbacks: StreamCallbacks) => {
      // Cancel any existing stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsPending(true);
      setProgress({ currentStep: null, completedSteps: [] });

      try {
        const res = await fetch('/api/ai/pipeline/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
        }

        // Read SSE stream chunk by chunk
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = '';
        const completed: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += value;
          // SSE events are separated by double newline
          const events = buffer.split('\n\n');
          // Last element might be incomplete — keep it as the new buffer
          buffer = events.pop() ?? '';

          for (const event of events) {
            const parsed = parseSseLine(event);
            if (!parsed) continue;

            if (parsed.done === true) {
              if (parsed.error) {
                throw new Error(parsed.error as string);
              }
              // Final result — call onSuccess
              callbacks.onSuccess(parsed.result as PipelineResponse);
            } else if (typeof parsed.step === 'string') {
              // Progress event — mark previous step as completed, set current
              const step = parsed.step;
              if (completed.at(-1) !== step) {
                // First time seeing this step — mark previous as done
                const newCompleted = progress.completedSteps.includes(step)
                  ? completed
                  : [...completed];
                // Move currentStep to completed if it was running
                if (progress.currentStep && !newCompleted.includes(progress.currentStep)) {
                  newCompleted.push(progress.currentStep);
                }
                // Don't mutate completed directly inside loop
                const updatedProgress: StreamProgress = {
                  currentStep: step,
                  completedSteps: [...newCompleted],
                };
                completed.splice(0, completed.length, ...updatedProgress.completedSteps);
                setProgress(updatedProgress);
                callbacks.onProgress?.(updatedProgress);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return; // user cancelled
        callbacks.onError(err instanceof Error ? err.message : 'AI service unavailable');
      } finally {
        abortRef.current = null;
        setIsPending(false);
        setProgress({ currentStep: null, completedSteps: [] });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { stream, isPending, progress, abort };
}

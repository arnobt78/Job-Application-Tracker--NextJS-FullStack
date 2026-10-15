'use client';

/**
 * useStreamPipeline — runs the AI pipeline via POST /api/ai/pipeline/stream (SSE)
 * and exposes per-agent progress while the 9 agents run.
 */

import { useCallback, useRef, useState } from 'react';
import type { PipelineRequest, PipelineResponse } from '@/lib/ai/pipeline-client';

type StreamProgress = {
  currentStep: string | null;
  completedSteps: string[];
};

type StreamCallbacks = {
  onProgress?: (progress: StreamProgress) => void;
  onSuccess: (result: PipelineResponse) => void;
  onError: (message: string) => void;
};

const IDLE_PROGRESS: StreamProgress = { currentStep: null, completedSteps: [] };

/** Parse a single SSE event (e.g. "data: {...}") and return the parsed JSON or null */
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
 * Returns { stream, isPending, progress, abort }.
 * Call stream(request, callbacks) to start a run; abort() cancels mid-run.
 * Exactly one of onSuccess / onError fires per run (none when aborted).
 */
export function useStreamPipeline() {
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState<StreamProgress>(IDLE_PROGRESS);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsPending(false);
    setProgress(IDLE_PROGRESS);
  }, []);

  const stream = useCallback(async (payload: PipelineRequest, callbacks: StreamCallbacks) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsPending(true);
    setProgress(IDLE_PROGRESS);

    // Local, not React state — the reader loop must see every step synchronously
    let current: string | null = null;
    const completed: string[] = [];
    let finished = false;
    let result: PipelineResponse | null = null;

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

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        // SSE events are separated by a blank line; the last chunk may be incomplete
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const parsed = parseSseLine(event);
          if (!parsed) continue;

          if (parsed.done === true) {
            finished = true;
            if (parsed.error) throw new Error(String(parsed.error));
            result = parsed.result as PipelineResponse;
            break;
          }

          if (typeof parsed.step === 'string' && parsed.step !== current) {
            if (current && !completed.includes(current)) completed.push(current);
            current = parsed.step;
            const next: StreamProgress = { currentStep: current, completedSteps: [...completed] };
            setProgress(next);
            callbacks.onProgress?.(next);
          }
        }
      }

      if (!finished) throw new Error('AI stream ended before a result was returned');
      await reader.cancel().catch(() => undefined);
    } catch (err) {
      if (!controller.signal.aborted) {
        callbacks.onError(err instanceof Error ? err.message : 'AI service unavailable');
      }
      return; // aborted = user cancelled or a newer run replaced this one
    } finally {
      // A newer run owns the shared state — leave it alone
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsPending(false);
        setProgress(IDLE_PROGRESS);
      }
    }

    // Outside try/catch so a throwing onSuccess never also triggers onError
    if (result) callbacks.onSuccess(result);
  }, []);

  return { stream, isPending, progress, abort };
}

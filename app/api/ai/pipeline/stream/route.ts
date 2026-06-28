/**
 * POST /api/ai/pipeline/stream — SSE streaming proxy to Python AI service.
 *
 * Authenticates with NextAuth, then forwards to Python /pipeline/run/stream.
 * Returns raw SSE stream so the browser can read per-agent progress events.
 *
 * SSE event shapes (from Python):
 *   data: {"step":"job-extractor","stepIndex":1,"total":9,"done":false}
 *   data: {"done":true,"result":{...PipelineResponse}}
 *   data: {"done":true,"error":"..."}
 */

import { auth } from '@/auth';
import type { PipelineRequest } from '@/lib/ai/pipeline-client';

export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? '';
// Streaming pipeline can take up to 90s on cold Ollama start
const TIMEOUT_MS = 90_000;

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: PipelineRequest;
  try {
    payload = (await request.json()) as PipelineRequest;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!payload?.job?.job_id) {
    return new Response(JSON.stringify({ error: 'job.job_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${AI_SERVICE_URL}/pipeline/run/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(AI_SERVICE_SECRET ? { 'X-Internal-Secret': AI_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      // @ts-expect-error — Node 18+ fetch supports duplex
      duplex: 'half',
    });

    if (!upstream.ok || !upstream.body) {
      clearTimeout(timer);
      const text = await upstream.text().catch(() => '');
      return new Response(
        `data: ${JSON.stringify({ done: true, error: `AI service ${upstream.status}: ${text}` })}\n\n`,
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
          },
        }
      );
    }

    // Pipe raw SSE stream through — browser reads events directly
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const message = isAbort ? 'AI service timed out' : 'AI service unavailable';
    return new Response(
      `data: ${JSON.stringify({ done: true, error: message })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}

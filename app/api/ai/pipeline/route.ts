/**
 * POST /api/ai/pipeline — proxy to Python AI service.
 *
 * Adds auth (NextAuth) before forwarding to Python, so the AI service
 * only needs to verify X-Internal-Secret — not session tokens directly.
 *
 * Request body: PipelineRequest (typed in lib/ai/pipeline-client.ts)
 * Response: PipelineResponse
 */

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { runAiPipeline, AiServiceError } from '@/lib/ai/pipeline-client';
import type { PipelineRequest } from '@/lib/ai/pipeline-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: PipelineRequest;
  try {
    payload = (await request.json()) as PipelineRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload?.job?.job_id) {
    return NextResponse.json({ error: 'job.job_id is required' }, { status: 400 });
  }

  try {
    const result = await runAiPipeline(payload);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AiServiceError) {
      const status = err.status >= 500 ? 502 : err.status;
      return NextResponse.json(
        { error: `AI service error: ${err.body}` },
        { status }
      );
    }
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'AI service timed out' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

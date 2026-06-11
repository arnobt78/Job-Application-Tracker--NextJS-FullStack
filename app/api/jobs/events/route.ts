/**
 * SSE stream for cross-tab / cross-instance invalidation after CRUD.
 * Pairs with publishInvalidation in lib/jobs-events.ts.
 */
import { auth } from '@clerk/nextjs/server';
import {
  pollRemoteInvalidation,
  subscribeInvalidations,
  type JobsInvalidationEvent,
} from '@/lib/jobs-events';

export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 30_000;
const REMOTE_POLL_MS = 2_000;

function encodeSse(data: JobsInvalidationEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  let lastRemoteTs = Date.now();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const push = (event: JobsInvalidationEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encodeSse(event));
        } catch {
          closed = true;
        }
      };

      const unsubscribe = subscribeInvalidations(userId, push);

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch {
          closed = true;
        }
      }, HEARTBEAT_MS);

      const remotePoll = setInterval(async () => {
        if (closed) return;
        const remote = await pollRemoteInvalidation(userId, lastRemoteTs);
        if (remote) {
          lastRemoteTs = remote.ts;
          push(remote.event);
        }
      }, REMOTE_POLL_MS);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        clearInterval(remotePoll);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

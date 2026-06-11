/**
 * SSE stream for cross-tab / cross-instance invalidation after CRUD.
 * Same-instance: in-memory bus. Cross-instance: Redis Streams XREAD BLOCK (no polling).
 */
import { auth } from '@clerk/nextjs/server';
import {
  awaitRemoteInvalidations,
  subscribeInvalidations,
  type JobsInvalidationEvent,
} from '@/lib/jobs-events';

export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 30_000;

function encodeSse(data: JobsInvalidationEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  let closed = false;
  /** '$' = only new stream entries after connect */
  let lastStreamId = '$';

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

      /** Redis Stream blocking loop — replaces 2s key polling */
      const streamLoop = async () => {
        while (!closed && !request.signal.aborted) {
          const { events, lastId } = await awaitRemoteInvalidations(
            userId,
            lastStreamId,
            5_000
          );
          lastStreamId = lastId;
          for (const event of events) {
            push(event);
          }
        }
      };
      void streamLoop();

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
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

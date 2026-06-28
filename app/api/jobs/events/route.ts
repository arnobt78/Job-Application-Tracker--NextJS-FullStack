/**
 * SSE stream for cross-tab / cross-instance invalidation and enrichment notifications.
 * Same-instance: in-memory bus. Cross-instance: Redis Streams XREAD BLOCK (no polling).
 * Multiplexes both 'invalidate' and 'notify' event types over the same stream.
 */
import { auth } from '@/auth';
import {
  awaitRemoteJobsEvents,
  subscribeJobsEvents,
  type JobsEvent,
} from '@/lib/jobs-events';

export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 30_000;

function encodeSse(data: JobsEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  let closed = false;
  /** '$' = only new stream entries after connect */
  let lastStreamId = '$';

  const stream = new ReadableStream({
    start(controller) {
      const push = (event: JobsEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encodeSse(event));
        } catch {
          closed = true;
        }
      };

      const unsubscribe = subscribeJobsEvents(userId, push);

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
          const { events, lastId } = await awaitRemoteJobsEvents(
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

/**
 * Sentry tunnel — forwards browser envelopes to ingest via same-origin /api/monitoring.
 * Ad blockers block *.sentry.io; this route is not on block lists.
 * Excluded from proxy.ts so error reports skip the NextAuth proxy (public by design).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getClientDsn, getServerDsn } from '@/lib/sentry/config';
import { resolveTunnelUpstream, SENTRY_TUNNEL_MAX_BYTES } from '@/lib/sentry/tunnel';

export const dynamic = 'force-dynamic';

/** Fail fast instead of holding a function open on a slow ingest */
const UPSTREAM_TIMEOUT_MS = 10_000;

/** Sentry rate-limit signals — forwarded so the browser SDK backs off instead of retrying */
const FORWARDED_HEADERS = ['content-type', 'retry-after', 'x-sentry-rate-limits'];

/** POST only — relay envelope to the configured Sentry ingest after DSN validation */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Browser envelopes carry NEXT_PUBLIC_SENTRY_DSN — validate against it, not the server alias
  const configuredDsn = getClientDsn() ?? getServerDsn();
  if (!configuredDsn) {
    return NextResponse.json({ error: 'Sentry not configured' }, { status: 503 });
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > SENTRY_TUNNEL_MAX_BYTES) {
    return NextResponse.json({ error: 'Envelope too large' }, { status: 413 });
  }

  // Raw bytes — envelope items (attachments) may be binary; only the header line is decoded
  const envelope = new Uint8Array(await request.arrayBuffer());
  if (envelope.byteLength === 0) {
    return NextResponse.json({ error: 'Empty envelope' }, { status: 400 });
  }
  // content-length may be absent (chunked) — re-check the actual body size
  if (envelope.byteLength > SENTRY_TUNNEL_MAX_BYTES) {
    return NextResponse.json({ error: 'Envelope too large' }, { status: 413 });
  }

  const newlineIndex = envelope.indexOf(0x0a);
  const headerLine = new TextDecoder().decode(
    newlineIndex === -1 ? envelope : envelope.subarray(0, newlineIndex)
  );
  const target = resolveTunnelUpstream(headerLine, configuredDsn);
  if (!target.ok) {
    return NextResponse.json({ error: target.error }, { status: target.status });
  }

  try {
    const response = await fetch(target.upstreamUrl, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const headers = new Headers();
    for (const name of FORWARDED_HEADERS) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');

    return new NextResponse(response.body, { status: response.status, headers });
  } catch {
    return NextResponse.json({ error: 'Upstream relay failed' }, { status: 502 });
  }
}

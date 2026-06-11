/**
 * Sentry tunnel — forwards browser envelopes to ingest via same-origin /api/monitoring.
 * Ad blockers block *.sentry.io; this route is not on block lists.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const configuredDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/** Extract project id from Sentry DSN URL path */
function getProjectIdFromDsn(dsn: string): string | null {
  try {
    const pathname = new URL(dsn).pathname.replace(/^\//, '');
    return pathname || null;
  } catch {
    return null;
  }
}

/** POST only — relay envelope to Sentry ingest after DSN validation */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!configuredDsn) {
    return NextResponse.json({ error: 'Sentry not configured' }, { status: 503 });
  }

  const envelope = await request.text();
  if (!envelope) {
    return NextResponse.json({ error: 'Empty envelope' }, { status: 400 });
  }

  const headerLine = envelope.split('\n')[0];
  if (!headerLine) {
    return NextResponse.json({ error: 'Invalid envelope' }, { status: 400 });
  }

  let envelopeDsn: string;
  try {
    const header = JSON.parse(headerLine) as { dsn?: string };
    if (!header.dsn) {
      return NextResponse.json({ error: 'Missing DSN in envelope' }, { status: 400 });
    }
    envelopeDsn = header.dsn;
  } catch {
    return NextResponse.json({ error: 'Invalid envelope header' }, { status: 400 });
  }

  // Prevent open relay — envelope must target our configured project only
  const expectedProjectId = getProjectIdFromDsn(configuredDsn);
  const envelopeProjectId = getProjectIdFromDsn(envelopeDsn);
  if (
    !expectedProjectId ||
    !envelopeProjectId ||
    expectedProjectId !== envelopeProjectId
  ) {
    return NextResponse.json({ error: 'DSN mismatch' }, { status: 403 });
  }

  const ingestUrl = new URL(envelopeDsn);
  const upstream = `https://${ingestUrl.host}/api/${envelopeProjectId}/envelope/`;

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Upstream relay failed' }, { status: 502 });
  }
}

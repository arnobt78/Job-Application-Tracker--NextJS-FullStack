import { describe, expect, it } from 'vitest';
import {
  getClientSentryOptions,
  getServerSentryOptions,
  sentryBeforeSend,
} from '@/lib/sentry/config';
import { resolveTunnelUpstream } from '@/lib/sentry/tunnel';

const CONFIGURED_DSN = 'https://publickey@o123.ingest.de.sentry.io/1234567';
const header = (dsn: unknown) => JSON.stringify({ dsn, sent_at: '2026-10-14T00:00:00Z' });

describe('resolveTunnelUpstream', () => {
  it('forwards to the configured ingest host for a matching DSN', () => {
    expect(resolveTunnelUpstream(header(CONFIGURED_DSN), CONFIGURED_DSN)).toEqual({
      ok: true,
      upstreamUrl: 'https://o123.ingest.de.sentry.io/api/1234567/envelope/',
    });
  });

  it('rejects a foreign host reusing our project id (SSRF / open relay)', () => {
    const forged = 'https://publickey@evil.example/1234567';
    expect(resolveTunnelUpstream(header(forged), CONFIGURED_DSN)).toMatchObject({
      ok: false,
      status: 403,
    });
  });

  it('rejects a different project on the same host', () => {
    const other = 'https://publickey@o123.ingest.de.sentry.io/999';
    expect(resolveTunnelUpstream(header(other), CONFIGURED_DSN)).toMatchObject({
      ok: false,
      status: 403,
    });
  });

  it('rejects malformed headers and missing DSNs', () => {
    expect(resolveTunnelUpstream('not-json', CONFIGURED_DSN)).toMatchObject({ ok: false, status: 400 });
    expect(resolveTunnelUpstream(header(undefined), CONFIGURED_DSN)).toMatchObject({ ok: false, status: 400 });
    expect(resolveTunnelUpstream(header(42), CONFIGURED_DSN)).toMatchObject({ ok: false, status: 400 });
  });

  it('refuses to relay when the configured DSN is invalid', () => {
    expect(resolveTunnelUpstream(header(CONFIGURED_DSN), 'not-a-dsn')).toMatchObject({
      ok: false,
      status: 403,
    });
  });
});

type BeforeSendEvent = Parameters<typeof sentryBeforeSend>[0];

const eventWithFrames = (filenames: string[]): BeforeSendEvent => ({
  type: undefined,
  exception: {
    values: [
      {
        type: 'TypeError',
        value: 'boom',
        stacktrace: { frames: filenames.map((filename) => ({ filename })) },
      },
    ],
  },
});

describe('ignoreErrors scope', () => {
  it('ignores network aborts/chunk loads in the browser but still reports them on the server', () => {
    const clientIgnores = getClientSentryOptions().ignoreErrors ?? [];
    const serverIgnores = getServerSentryOptions().ignoreErrors ?? [];

    expect(clientIgnores).toContain('AbortError');
    expect(clientIgnores.some((p) => p instanceof RegExp && p.test('Failed to load chunk /_next/static/chunks/a.js'))).toBe(true);
    expect(serverIgnores).not.toContain('AbortError');
    expect(serverIgnores).not.toContain('Failed to fetch');
  });
});

describe('sentryBeforeSend', () => {
  it('drops events whose frames all come from browser extensions', () => {
    const event = eventWithFrames(['chrome-extension://abc/content.js', 'moz-extension://x/inject.js']);
    expect(sentryBeforeSend(event)).toBeNull();
  });

  it('keeps events that include at least one app frame', () => {
    const event = eventWithFrames([
      'chrome-extension://abc/content.js',
      'https://jobify-tracker.vercel.app/_next/static/chunks/app.js',
    ]);
    expect(sentryBeforeSend(event)).toBe(event);
  });

  it('drops frame-less third-party messages and keeps app messages', () => {
    expect(sentryBeforeSend({ type: undefined, message: 'grammarly widget failed' })).toBeNull();
    const appEvent: BeforeSendEvent = { type: undefined, message: 'Job save failed' };
    expect(sentryBeforeSend(appEvent)).toBe(appEvent);
  });
});

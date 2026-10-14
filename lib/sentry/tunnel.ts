/**
 * Sentry tunnel target resolution — pure, framework-free (unit tested).
 *
 * Security: the upstream URL is always built from the *configured* DSN, and the
 * envelope's DSN must match it on both host and project id. The envelope header
 * is client-controlled, so trusting its host would turn /api/monitoring into an
 * open relay (SSRF) to any server reachable from our functions.
 */

/** Browser error envelopes are a few KB; cap protects function memory/CPU */
export const SENTRY_TUNNEL_MAX_BYTES = 1024 * 1024;

type ParsedDsn = { host: string; projectId: string };

export type TunnelResolution =
  | { ok: true; upstreamUrl: string }
  | { ok: false; status: 400 | 403; error: string };

function parseDsn(dsn: string): ParsedDsn | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\/+|\/+$/g, '');
    if (url.protocol !== 'https:' || !url.host || !/^\d+$/.test(projectId)) {
      return null;
    }
    return { host: url.host.toLowerCase(), projectId };
  } catch {
    return null;
  }
}

/** Validate the first envelope line against the configured DSN */
export function resolveTunnelUpstream(
  envelopeHeaderLine: string,
  configuredDsn: string
): TunnelResolution {
  const configured = parseDsn(configuredDsn);
  if (!configured) {
    return { ok: false, status: 403, error: 'Sentry DSN misconfigured' };
  }

  let envelopeDsn: unknown;
  try {
    envelopeDsn = (JSON.parse(envelopeHeaderLine) as { dsn?: unknown }).dsn;
  } catch {
    return { ok: false, status: 400, error: 'Invalid envelope header' };
  }
  if (typeof envelopeDsn !== 'string' || !envelopeDsn) {
    return { ok: false, status: 400, error: 'Missing DSN in envelope' };
  }

  const incoming = parseDsn(envelopeDsn);
  if (
    !incoming ||
    incoming.host !== configured.host ||
    incoming.projectId !== configured.projectId
  ) {
    return { ok: false, status: 403, error: 'DSN mismatch' };
  }

  return {
    ok: true,
    upstreamUrl: `https://${configured.host}/api/${configured.projectId}/envelope/`,
  };
}

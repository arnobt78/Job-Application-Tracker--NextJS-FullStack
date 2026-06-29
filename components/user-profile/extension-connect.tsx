'use client';

/**
 * ExtensionConnect — browser extension token generator on the /profile page.
 *
 * Calls GET /api/extension/token to generate or retrieve the user's extension token.
 * Shows copy button + install instructions. Token never expires until regenerated.
 */

import { useState } from 'react';
import { Puzzle, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TokenState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; token: string; copied: boolean }
  | { status: 'error'; message: string };

export function ExtensionConnect() {
  const [state, setState] = useState<TokenState>({ status: 'idle' });

  async function generateToken() {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/extension/token');
      if (!res.ok) throw new Error('Server error');
      const data = (await res.json()) as { token: string };
      setState({ status: 'ready', token: data.token, copied: false });
    } catch {
      setState({ status: 'error', message: 'Could not generate token. Please try again.' });
    }
  }

  async function copyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setState((prev) => (prev.status === 'ready' ? { ...prev, copied: true } : prev));
      setTimeout(
        () => setState((prev) => (prev.status === 'ready' ? { ...prev, copied: false } : prev)),
        2000
      );
    } catch {
      // Clipboard write failed — user can manually copy
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Puzzle className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-indigo-300">Browser Extension</h3>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Track jobs with one click from LinkedIn, Greenhouse, Lever, or any career page.
        Install the extension and paste your token to connect.
      </p>

      {state.status === 'idle' && (
        <Button
          variant="outline"
          size="sm"
          onClick={generateToken}
          className="gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
        >
          <Puzzle className="h-3.5 w-3.5" />
          Generate Extension Token
        </Button>
      )}

      {state.status === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Generating token…
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-rose-400">{state.message}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateToken}
            className="w-fit text-xs"
          >
            Try again
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border/30 bg-black/30 px-3 py-2 font-mono text-[10px] text-muted-foreground">
              {state.token}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToken(state.token)}
              className="shrink-0 gap-1.5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
            >
              {state.copied ? (
                <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copy</>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide mb-1.5">
              Setup Instructions
            </p>
            <ol className="flex flex-col gap-1 text-[10px] text-muted-foreground">
              <li>1. Download the extension from <code className="text-indigo-300">browser-extension/</code> in the repo</li>
              <li>2. Load it in Chrome via <code className="text-indigo-300">chrome://extensions</code> → Load unpacked</li>
              <li>3. Click the Jobify icon and paste your token above</li>
              <li>4. Visit any job page and click &ldquo;Track This Job&rdquo;</li>
            </ol>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={generateToken}
            className="w-fit gap-1 text-xs text-muted-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Regenerate token
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * EmailInboundSetup — auto-apply email detection setup on /profile.
 *
 * Generates a unique inbound email address via generateInboundEmailAction.
 * User forwards job application confirmations to this address.
 * Resend webhook at /api/email/inbound parses and creates jobs automatically.
 */

import { useState } from 'react';
import { Mail, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateInboundEmailAction } from '@/utils/actions';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; address: string; copied: boolean }
  | { status: 'error'; message: string };

export function EmailInboundSetup() {
  const [state, setState] = useState<State>({ status: 'idle' });

  async function enable() {
    setState({ status: 'loading' });
    try {
      const address = await generateInboundEmailAction();
      setState({ status: 'ready', address, copied: false });
    } catch {
      setState({ status: 'error', message: 'Could not generate email address. Please try again.' });
    }
  }

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setState((prev) => (prev.status === 'ready' ? { ...prev, copied: true } : prev));
      setTimeout(
        () => setState((prev) => (prev.status === 'ready' ? { ...prev, copied: false } : prev)),
        2000
      );
    } catch {
      // Clipboard write failed — user can copy manually
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-sky-400" />
        <h3 className="text-sm font-semibold text-sky-300">Auto-Apply Detection</h3>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Forward job application confirmation emails to your unique Jobify address and they&apos;ll
        be automatically tracked on your dashboard.
      </p>

      {state.status === 'idle' && (
        <Button
          variant="outline"
          size="sm"
          onClick={enable}
          className="gap-2 border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
        >
          <Mail className="h-3.5 w-3.5" />
          Enable Auto-Apply Detection
        </Button>
      )}

      {state.status === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Setting up your email address…
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-rose-400">{state.message}</p>
          <Button variant="ghost" size="sm" onClick={enable} className="w-fit text-xs">
            Try again
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border/30 bg-black/30 px-3 py-2 font-mono text-[10px] text-sky-300">
              {state.address}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyAddress(state.address)}
              className="shrink-0 gap-1.5 border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
            >
              {state.copied ? (
                <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copy</>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wide mb-1.5">
              How to use
            </p>
            <ol className="flex flex-col gap-1 text-[10px] text-muted-foreground">
              <li>1. Copy the address above</li>
              <li>2. Create an email filter in Gmail/Outlook for keywords like <code className="text-sky-300">&ldquo;Thank you for applying&rdquo;</code></li>
              <li>3. Auto-forward matching emails to this address</li>
              <li>4. New jobs appear on your dashboard within seconds</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import Link, { useLinkStatus } from 'next/link';
import type { ComponentProps, FocusEvent, PointerEvent, ReactNode, TouchEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useIntentPrefetch } from '@/hooks/useIntentPrefetch';

type IntentLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'prefetch'> & {
  href: string;
};

/**
 * Next Link with intent-only prefetch (hover / focus / touch) — no viewport prefetch requests.
 * Caller handlers (e.g. Radix `asChild` menu items) are composed, not overridden.
 */
export function IntentLink({ href, onPointerEnter, onFocus, onTouchStart, ...props }: IntentLinkProps) {
  const prefetch = useIntentPrefetch(href);

  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={(e: PointerEvent<HTMLAnchorElement>) => {
        prefetch();
        onPointerEnter?.(e);
      }}
      onFocus={(e: FocusEvent<HTMLAnchorElement>) => {
        prefetch();
        onFocus?.(e);
      }}
      onTouchStart={(e: TouchEvent<HTMLAnchorElement>) => {
        prefetch();
        onTouchStart?.(e);
      }}
      {...props}
    />
  );
}

/** Icon slot that swaps to a same-size spinner while its parent Link navigation is pending */
export function LinkPendingIcon({ icon }: { icon: ReactNode }) {
  const { pending } = useLinkStatus();
  return pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <>{icon}</>;
}

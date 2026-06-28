'use client';

/**
 * PostHogProvider — initialises PostHog once and identifies the signed-in user.
 *
 * Wrap inside NavUserProvider so useNavUserSession() is available.
 * Gracefully no-ops when NEXT_PUBLIC_POSTHOG_KEY is absent.
 */

import { useEffect, type PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { initPostHog, identifyUser, trackEvent } from '@/lib/analytics/posthog';
import { useNavUserSession } from '@/hooks/useNavUserSession';

export function PostHogProvider({ children }: PropsWithChildren) {
  const { effectiveUser, displayName, email } = useNavUserSession();
  const pathname = usePathname();

  // Initialise PostHog once on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user once NextAuth session resolves their ID
  useEffect(() => {
    if (!effectiveUser?.id) return;
    identifyUser(effectiveUser.id, {
      email: email || undefined,
      name: displayName || undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUser?.id]);

  // Track page views on route change (supplement to PostHog's autocapture:false)
  useEffect(() => {
    trackEvent('$pageview', { $current_url: pathname });
  }, [pathname]);

  return <>{children}</>;
}

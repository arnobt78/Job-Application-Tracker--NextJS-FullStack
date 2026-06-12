'use client';

import { NavShell } from '@/components/layout/nav-shell';
import { SiteLogo } from '@/components/layout/site-logo';
import ThemeToggle from '@/components/ThemeToggle';
import { RippleLink } from '@/components/ui/ripple-link';
import { Home } from 'lucide-react';

/**
 * Minimal navbar for sign-in and sign-up pages.
 * Logo (links to /) on left, ThemeToggle + Return Home button on right.
 */
export function AuthNav() {
  return (
    <NavShell>
      {/* Logo linked to landing page */}
      <SiteLogo priority />

      {/* Right — ThemeToggle + Return Home */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <RippleLink
          href="/"
          size="sm"
          className="h-9 gap-1.5 rounded-full border border-primary/30 px-4 text-xs shadow-sm shadow-primary/20 sm:h-10 sm:px-5 sm:text-sm"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Return Home</span>
        </RippleLink>
      </div>
    </NavShell>
  );
}

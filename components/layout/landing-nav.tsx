'use client';

import { NavShell } from '@/components/layout/nav-shell';
import { SiteLogo } from '@/components/layout/site-logo';
import ThemeToggle from '@/components/ThemeToggle';
import { RippleLink } from '@/components/ui/ripple-link';
import { LANDING_SECTIONS } from '@/lib/ui/landing-sections';
import { cn } from '@/lib/utils';
import { UserPlus } from 'lucide-react';

/** Fixed landing page nav — logo scroll-to-top | section links | ThemeToggle + CTA */
export function LandingNav() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <NavShell>
      {/* Logo — click scrolls to hero */}
      <button
        type="button"
        onClick={() => scrollToSection('hero')}
        className="flex h-full shrink-0 items-center rounded-lg transition hover:opacity-90"
        aria-label="Scroll to top"
      >
        <SiteLogo priority linked={false} />
      </button>

      {/* Center section links — hidden on mobile */}
      <nav
        className="hidden h-full items-center gap-0.5 md:flex"
        aria-label="Landing sections"
      >
        {LANDING_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className={cn(
              'flex h-8 items-center rounded-full px-3 text-sm font-medium text-foreground/75',
              'transition hover:bg-white/10 hover:text-foreground'
            )}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Right — ThemeToggle + Create Account CTA */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <RippleLink
          href="/sign-up"
          size="sm"
          className="h-9 gap-1.5 rounded-full border border-primary/30 px-4 text-xs sm:h-10 sm:px-5 sm:text-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Account</span>
          <span className="sm:hidden">Sign up</span>
        </RippleLink>
      </div>
    </NavShell>
  );
}

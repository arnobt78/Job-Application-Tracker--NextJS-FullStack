'use client';

import { PageContainer } from '@/components/layout/page-container';
import { SiteLogo } from '@/components/layout/site-logo';
import { RippleLink } from '@/components/ui/ripple-link';
import {
  LANDING_CHROME_HEIGHT_CLASS,
  LANDING_CHROME_SHELL_CLASS,
  LANDING_CHROME_WRAPPER_CLASS,
} from '@/lib/ui/landing-chrome';
import { LANDING_SECTIONS } from '@/lib/ui/landing-sections';
import { cn } from '@/lib/utils';
import { UserPlus } from 'lucide-react';

/** Fixed h-14 navbar — items centered on Y axis, no py */
export function LandingNav() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-50',
        LANDING_CHROME_HEIGHT_CLASS,
        LANDING_CHROME_WRAPPER_CLASS
      )}
    >
      <PageContainer
        as="div"
        className={cn(
          'pointer-events-auto h-full',
          LANDING_CHROME_SHELL_CLASS
        )}
      >
        <button
          type="button"
          onClick={() => scrollToSection('hero')}
          className="flex h-full shrink-0 items-center rounded-lg transition hover:opacity-90"
          aria-label="Scroll to top"
        >
          <SiteLogo priority linked={false} />
        </button>

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

        <RippleLink
          href="/sign-up"
          size="sm"
          className="h-9 shrink-0 gap-1.5 rounded-full border border-primary/30 px-4 text-xs sm:h-10 sm:px-5 sm:text-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Account</span>
          <span className="sm:hidden">Sign up</span>
        </RippleLink>
      </PageContainer>
    </header>
  );
}

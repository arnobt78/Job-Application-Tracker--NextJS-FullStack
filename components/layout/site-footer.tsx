'use client';

import { Copyright } from '@/components/layout/copyright';
import { PageContainer } from '@/components/layout/page-container';
import {
  LANDING_CHROME_HEIGHT_CLASS,
  LANDING_CHROME_SHELL_CLASS,
  LANDING_CHROME_WRAPPER_CLASS,
} from '@/lib/ui/landing-chrome';
import { cn } from '@/lib/utils';

/** h-14 footer bar — same chrome as navbar, no py */
export function SiteFooter() {
  return (
    <footer
      className={cn(
        'relative z-20',
        LANDING_CHROME_HEIGHT_CLASS,
        LANDING_CHROME_WRAPPER_CLASS
      )}
    >
      <PageContainer
        as="div"
        className={cn('h-full', LANDING_CHROME_SHELL_CLASS, 'justify-center')}
      >
        <Copyright />
      </PageContainer>
    </footer>
  );
}

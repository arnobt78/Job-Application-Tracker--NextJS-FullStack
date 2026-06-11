import { Copyright } from '@/components/layout/copyright';
import { PageContainer } from '@/components/layout/page-container';

/** Glass footer for marketing/auth pages */
export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-background/60 py-8 backdrop-blur-xl">
      <PageContainer className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Copyright />
        <p className="text-sm text-muted-foreground/80">
          Jobify — track applications with clarity
        </p>
      </PageContainer>
    </footer>
  );
}

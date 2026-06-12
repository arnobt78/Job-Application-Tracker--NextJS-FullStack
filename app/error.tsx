'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';

/** Segment error boundary — captures route errors; complements app/global-error.tsx */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="app-shell min-h-screen">
      <div className="app-shell-overlay" aria-hidden />
      <PageContainer className="flex min-h-screen flex-col items-center justify-center gap-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-foreground/90">
          Something went wrong
        </h2>
        <p className="max-w-md text-muted-foreground">
          An unexpected error occurred. You can try again or return to the
          dashboard.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </PageContainer>
    </div>
  );
}

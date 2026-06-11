import { SignUpPageContent } from '@/components/pages/SignUpPageContent';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Sign Up',
  description:
    'Create your free Jobify account to start tracking job applications, viewing analytics, and exporting your job search data.',
  path: '/sign-up',
});

export default function SignUpPage() {
  return (
    <main className="app-shell min-h-screen">
      <div className="app-shell-overlay" aria-hidden />
      <SignUpPageContent />
    </main>
  );
}

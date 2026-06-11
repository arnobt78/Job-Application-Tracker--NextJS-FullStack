import { SignInPageContent } from '@/components/pages/SignInPageContent';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Sign In',
  description:
    'Sign in to Jobify to manage your job applications, view analytics, and export your job search data.',
  path: '/sign-in',
});

interface SignInPageProps {
  searchParams?: Promise<{ guest?: string }>;
}

export default async function SignInPage(props: SignInPageProps) {
  const searchParams = await props.searchParams;
  const isGuest = searchParams?.guest === 'true';

  return (
    <main className="app-shell min-h-screen">
      <div className="app-shell-overlay" aria-hidden />
      <SignInPageContent isGuest={isGuest} />
    </main>
  );
}

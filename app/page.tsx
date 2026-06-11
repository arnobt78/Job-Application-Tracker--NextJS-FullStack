import HomePage from '@/components/pages/HomePage';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Jobify — Job Tracking Application | Organize Your Job Search',
  description:
    'Track job applications, filter by status, visualize progress with analytics, and export your job search history. Free, open-source job tracker built with Next.js, TypeScript, Clerk, Prisma, and PostgreSQL.',
  path: '/',
});

/** SSR shell — client landing sections in HomePage */
export default function Home() {
  return (
    <div className="app-shell">
      <div className="app-shell-overlay" aria-hidden />
      <HomePage />
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { Rocket } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Jobify — Job Tracking Application | Organize Your Job Search',
  description:
    'Track job applications, filter by status, visualize progress with analytics, and export your job search history. Free, open-source job tracker built with Next.js, TypeScript, Clerk, Prisma, and PostgreSQL.',
  path: '/',
});

export default function Home() {
  return (
    <div className="app-shell">
      <div className="app-shell-overlay" aria-hidden />
      <main className="relative z-10">
        <header className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <SafeImage src="/logo.svg" alt="Jobify logo" width={164} height={50} priority />
        </header>
        <section className="max-w-7xl mx-auto px-4 sm:px-8 min-h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center pb-16">
          <div>
            <h1 className="capitalize text-4xl md:text-7xl font-bold">
              job <span className="text-primary">tracking</span> app
            </h1>
            <p className="leading-loose max-w-2xl mt-4 text-justify text-muted-foreground">
              <strong className="text-foreground">Jobify Tracking App</strong> is a
              modern, full-featured job application tracker for organizing and
              analyzing your job search. Built with Next.js, TypeScript, Clerk,
              Prisma, and PostgreSQL.
            </p>
            <div className="cta-shine-wrap mt-6">
              <Button asChild className="cta-shine-button glass-btn-primary gap-2">
                <Link href="/add-job">
                  <Rocket className="h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
          <SafeImage
            src="/main.svg"
            alt="Jobify dashboard illustration"
            className="hidden lg:block"
            width={400}
            height={400}
          />
        </section>
      </main>
    </div>
  );
}

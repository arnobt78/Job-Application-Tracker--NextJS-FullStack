import { SafeImage } from '@/components/ui/safe-image';
import SignUpWrapper from '@/components/SignUpWrapper';
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
      <div className="relative z-10">
        <header className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <SafeImage src="/logo.svg" alt="Jobify logo" width={164} height={50} priority />
        </header>
        <section className="max-w-7xl mx-auto px-4 sm:px-8 min-h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center">
          <SafeImage
            src="/main.svg"
            alt="landing illustration"
            className="hidden lg:block"
            width={400}
            height={400}
          />
          <div className="flex justify-center">
            <SignUpWrapper />
          </div>
        </section>
      </div>
    </main>
  );
}

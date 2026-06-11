import { SafeImage } from "@/components/ui/safe-image";
import SignInForm from "@/components/SignInForm";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to Jobify to manage your job applications, view analytics, and export your job search data.",
  path: "/sign-in",
});

interface SignInPageProps {
  searchParams?: Promise<{ guest?: string }>;
}

export default async function SignInPage(props: SignInPageProps) {
  const searchParams = await props.searchParams;
  const isGuest = searchParams?.guest === "true";

  return (
    <main className="app-shell min-h-screen">
      <div className="app-shell-overlay" />
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
          <SignInForm isGuest={isGuest} />
        </section>
      </div>
    </main>
  );
}

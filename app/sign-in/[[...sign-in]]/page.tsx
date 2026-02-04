import Image from "next/image";
import SignInForm from "@/components/SignInForm";

interface SignInPageProps {
  searchParams?: { guest?: string };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const isGuest = searchParams?.guest === "true";

  return (
    <main>
      <header className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <Image src="/logo.svg" alt="jobify logo" width={164} height={50} priority />
      </header>
      <section className="max-w-7xl mx-auto px-4 sm:px-8 h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center">
        <Image
          src="/main.svg"
          alt="landing illustration"
          className="hidden lg:block"
          width={400}
          height={400}
        />
        <SignInForm isGuest={isGuest} />
      </section>
    </main>
  );
}

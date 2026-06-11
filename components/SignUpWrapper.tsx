'use client';

import { useAuth } from '@clerk/nextjs';
import { SignUp } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/glass-card';

const clerkAppearance = {
  elements: {
    rootBox: 'w-full',
    card: 'bg-transparent shadow-none border-0 p-0',
    headerTitle: 'text-foreground',
    headerSubtitle: 'text-muted-foreground',
    socialButtonsBlockButton: 'border-white/10 bg-background/50',
    formFieldInput: 'glass-input',
    formButtonPrimary:
      'bg-primary text-white/90 hover:bg-primary/90 shadow-[0_15px_35px_rgba(59,130,246,0.45)]',
  },
};

/** Clerk sign-up inside emerald glass shell — matches sign-in sky glow pattern */
export default function SignUpWrapper() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="w-full max-w-md">
        <GlassCard variant="emerald">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="mb-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <Skeleton className="h-4 w-6 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="mt-4 flex justify-center">
            <Skeleton className="h-4 w-56" />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard variant="emerald" className="p-4 sm:p-6">
        <SignUp
          signInUrl="/sign-in"
          afterSignUpUrl="/add-job"
          appearance={clerkAppearance}
        />
      </GlassCard>
    </div>
  );
}

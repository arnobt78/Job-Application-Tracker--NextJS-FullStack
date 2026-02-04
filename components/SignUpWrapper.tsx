'use client';

import { useAuth } from '@clerk/nextjs';
import { SignUp } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';

export default function SignUpWrapper() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="w-full max-w-[400px]">
        <div className="bg-muted p-8 rounded-lg">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="space-y-4 mb-4">
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
          <div className="flex justify-center mt-4">
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <SignUp
      signInUrl="/sign-in"
      afterSignUpUrl="/add-job"
      appearance={{
        elements: {
          rootBox: 'mx-auto',
        },
      }}
    />
  );
}

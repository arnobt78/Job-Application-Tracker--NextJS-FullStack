import Link from 'next/link';
import { UserProfile } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';

export default function UserProfilePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/add-job"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex justify-center">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}

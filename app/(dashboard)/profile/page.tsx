import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';
import { queryKeys } from '@/lib/query-keys';
import { getUserProfileAction } from '@/utils/actions';
import { UserProfileForm } from '@/components/user-profile/user-profile-form';
import { ResumeUpload } from '@/components/user-profile/resume-upload';
import { GlassCard } from '@/components/ui/glass-card';
import { PageSectionHeader } from '@/components/ui/page-section-header';
import { User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'My Profile',
  description: 'Set your skills, target roles, and resume text for personalised AI insights.',
  path: '/profile',
  noIndex: true,
});

/** User profile settings page — SSR-prefetches existing profile so form loads instantly. */
async function UserProfilePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => getUserProfileAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mb-6">
        <PageSectionHeader
          icon={User}
          title="My Profile"
          subtitle="Your AI personalisation profile — used to generate fit scores, cover letters, and interview angles"
          headingLevel="h1"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2">
          <GlassCard variant="violet">
            <UserProfileForm />
          </GlassCard>
        </div>

        {/* Side info panel */}
        <div className="flex flex-col gap-4">
          <GlassCard variant="sky">
            <h3 className="mb-2 text-sm font-semibold text-sky-300">How it works</h3>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li>• Add your skills so the AI can score how well you match each job</li>
              <li>• Target roles tell the AI what kind of cover letter tone to use</li>
              <li>• Pasting your resume unlocks personalised interview angle suggestions</li>
              <li>• All data stays in your account — never shared or used for training</li>
            </ul>
          </GlassCard>

          <GlassCard variant="emerald">
            <h3 className="mb-2 text-sm font-semibold text-emerald-300">Tips</h3>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li>• Skills: be specific (TypeScript, not just &ldquo;coding&rdquo;)</li>
              <li>• Roles: include seniority (Senior, Staff, Principal)</li>
              <li>• Resume: paste plain text — no formatting needed</li>
            </ul>
          </GlassCard>

          {/* PDF upload — extracts text and auto-fills resumeText in the form below */}
          <GlassCard variant="neutral">
            <ResumeUpload />
          </GlassCard>
        </div>
      </div>
    </HydrationBoundary>
  );
}

export default UserProfilePage;

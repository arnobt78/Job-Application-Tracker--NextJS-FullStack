'use client';

import { AuthMarketingPanel } from '@/components/layout/auth-marketing-panel';
import { TestAccountAvatar } from '@/components/auth/test-account-avatar';
import { GlassCard } from '@/components/ui/glass-card';
import type { TestAccount } from '@/lib/auth/test-credentials';
import { cn } from '@/lib/utils';

type AuthSignInLeadingPanelProps = {
  selectedAccount: TestAccount | null;
  className?: string;
};

/** Left column on sign-in — marketing or selected test account preview */
export function AuthSignInLeadingPanel({
  selectedAccount,
  className,
}: AuthSignInLeadingPanelProps) {
  if (selectedAccount) {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <GlassCard variant="neutral" className="p-5">
          <div className="flex items-center gap-4">
            <TestAccountAvatar
              name={selectedAccount.name}
              email={selectedAccount.email}
              imageUrl={selectedAccount.imageUrl}
              size="lg"
              preload
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-lg font-semibold text-foreground">
                {selectedAccount.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {selectedAccount.email}
              </p>
            </div>
          </div>
        </GlassCard>
        <AuthMarketingPanel variant="sign-in" />
      </div>
    );
  }

  return <AuthMarketingPanel variant="sign-in" className={className} />;
}

'use client';

import { AuthMarketingPanel } from '@/components/layout/auth-marketing-panel';
import { TestAccountAvatar } from '@/components/auth/test-account-avatar';
import { GlassCard } from '@/components/ui/glass-card';
import type { TestAccount } from '@/lib/auth/test-credentials';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type AuthSignInLeadingPanelProps = {
  selectedAccount: TestAccount | null;
  isLoading: boolean;
  className?: string;
};

/** Left column on sign-in — marketing, selected test account preview, or signing-in spinner */
export function AuthSignInLeadingPanel({
  selectedAccount,
  isLoading,
  className,
}: AuthSignInLeadingPanelProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-[280px] flex-col items-center justify-center gap-4',
          className
        )}
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
        <p className="text-lg font-medium text-foreground/90">Signing in...</p>
        <p className="text-sm text-muted-foreground">Taking you to your dashboard</p>
      </div>
    );
  }

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

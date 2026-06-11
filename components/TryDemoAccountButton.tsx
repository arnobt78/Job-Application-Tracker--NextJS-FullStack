'use client';

import { RippleButton } from '@/components/ui/ripple-button';
import { useGuestSignIn } from '@/hooks/useGuestSignIn';
import { cn } from '@/lib/utils';
import { ArrowRight, Zap } from 'lucide-react';

type TryDemoAccountButtonProps = {
  className?: string;
};

/** Emerald demo CTA — one-click guest sign-in from landing */
export function TryDemoAccountButton({ className }: TryDemoAccountButtonProps) {
  const { signInAsGuest, isLoading, isReady } = useGuestSignIn();

  return (
    <div className={cn('cta-shine-wrap inline-block rounded-full', className)}>
      <RippleButton
        type="button"
        disabled={!isReady || isLoading}
        onClick={() => void signInAsGuest()}
        className={cn(
          'cta-shine-button inline-flex items-center gap-2 rounded-full px-8',
          'border border-emerald-400/30 bg-gradient-to-r from-emerald-500/70 via-emerald-500/50 to-emerald-500/30',
          'text-sm font-medium text-white/90 shadow-[0_15px_35px_rgba(16,185,129,0.45)]',
          'hover:from-emerald-500/80 hover:via-emerald-600/60 hover:to-emerald-500/40',
          '[&_svg]:text-white/90'
        )}
      >
        <Zap className="h-4 w-4" />
        {isLoading ? 'Signing in...' : 'Try Demo Account'}
        <ArrowRight className="h-4 w-4" />
      </RippleButton>
    </div>
  );
}

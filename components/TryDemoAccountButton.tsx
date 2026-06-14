'use client';

import { RippleButton } from '@/components/ui/ripple-button';
import { useGuestSignIn } from '@/hooks/useGuestSignIn';
import { HERO_CTA_CLASS } from '@/lib/ui/marketing-assets';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, Zap } from 'lucide-react';

type TryDemoAccountButtonProps = {
  className?: string;
  /** Stagger shine sweep vs Get Started (a | b) */
  shineDelay?: 'a' | 'b';
};

/** Emerald demo CTA — same height as Get Started (HERO_CTA_CLASS) */
export function TryDemoAccountButton({
  className,
  shineDelay = 'b',
}: TryDemoAccountButtonProps) {
  const { signInAsGuest, isLoading, isReady } = useGuestSignIn();

  return (
    <div
      className={cn(
        'cta-shine-wrap rounded-full',
        shineDelay === 'a' ? 'cta-shine-wrap--delay-a' : 'cta-shine-wrap--delay-b',
        className
      )}
    >
      <RippleButton
        type="button"
        disabled={!isReady || isLoading}
        onClick={() => void signInAsGuest()}
        className={cn(
          HERO_CTA_CLASS,
          'gap-2',
          'border border-emerald-400/30 bg-gradient-to-r from-emerald-500/70 via-emerald-500/50 to-emerald-500/30',
          'text-white/90 shadow-[0_15px_35px_rgba(16,185,129,0.45)]',
          'hover:from-emerald-500/80 hover:via-emerald-600/60 hover:to-emerald-500/40',
          '[&_svg]:text-white/90'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Signing in...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 shrink-0" />
            Try Demo Account
            <ArrowRight className="h-4 w-4 shrink-0" />
          </>
        )}
      </RippleButton>
    </div>
  );
}

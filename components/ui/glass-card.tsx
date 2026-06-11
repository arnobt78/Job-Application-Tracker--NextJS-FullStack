import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export type GlassVariant = 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'neutral';

const variantClasses: Record<GlassVariant, string> = {
  sky: 'border-sky-400/30 bg-gradient-to-br from-sky-500/25 via-sky-500/10 to-sky-500/5 shadow-[0_30px_80px_rgba(2,132,199,0.35)] hover:border-sky-300/50',
  emerald:
    'border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-emerald-500/5 shadow-[0_30px_80px_rgba(16,185,129,0.3)] hover:border-emerald-300/50',
  amber:
    'border-amber-400/30 bg-gradient-to-br from-amber-500/30 via-amber-500/15 to-amber-500/5 shadow-[0_30px_80px_rgba(245,158,11,0.25)] hover:border-amber-300/60',
  rose: 'border-rose-400/30 bg-gradient-to-br from-rose-500/25 via-rose-500/10 to-rose-500/5 shadow-[0_30px_80px_rgba(225,29,72,0.35)] hover:border-rose-300/50',
  violet:
    'border-violet-400/30 bg-gradient-to-br from-violet-500/25 via-violet-500/10 to-violet-500/5 shadow-[0_30px_80px_rgba(139,92,246,0.35)] hover:border-violet-300/50',
  neutral:
    'border-white/10 dark:border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/5 shadow-lg hover:border-white/20',
};

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassVariant;
};

/** Glassmorphic card with colored shadow glow per UI_STYLING_GUIDE */
export function GlassCard({
  variant = 'neutral',
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] border p-6 backdrop-blur-sm transition',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

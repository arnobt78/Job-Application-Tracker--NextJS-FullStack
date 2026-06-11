import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Filter,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

type AuthVariant = 'sign-in' | 'sign-up';

const AUTH_COPY: Record<
  AuthVariant,
  { eyebrow: string; title: string; highlight: string; body: string }
> = {
  'sign-in': {
    eyebrow: 'Welcome back',
    title: 'Modern job',
    highlight: 'tracking platform',
    body: 'Sign in to manage applications, view analytics, and export your search history — with instant sync across every tab.',
  },
  'sign-up': {
    eyebrow: 'Get started',
    title: 'Join the modern',
    highlight: 'job search stack',
    body: 'Create a free account and organize every application with filters, charts, and real-time updates across devices.',
  },
};

const AUTH_FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: RefreshCw, label: 'Real-time sync' },
  { icon: Filter, label: 'Smart filters' },
  { icon: BarChart3, label: 'Analytics charts' },
  { icon: ShieldCheck, label: 'Secure Clerk auth' },
];

type AuthMarketingPanelProps = {
  variant: AuthVariant;
  className?: string;
};

/** Static left-column copy for auth pages — mirrors HealthCal marketing panel */
export function AuthMarketingPanel({ variant, className }: AuthMarketingPanelProps) {
  const copy = AUTH_COPY[variant];

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
          {copy.title}{' '}
          <span className="text-primary">{copy.highlight}</span>
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          {copy.body}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {AUTH_FEATURES.map((feature) => (
          <GlassCard key={feature.label} variant="neutral" className="p-4">
            <div className="flex items-center gap-3">
              <feature.icon className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground/90">
                {feature.label}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

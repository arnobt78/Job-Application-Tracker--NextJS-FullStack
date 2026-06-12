'use client';

import { TestAccountAvatar } from '@/components/auth/test-account-avatar';
import { cn } from '@/lib/utils';

type TestAccountSelectRowProps = {
  name: string;
  email: string;
  imageUrl?: string;
  className?: string;
};

/** Compact single-row layout for test account select trigger + items */
export function TestAccountSelectRow({
  name,
  email,
  imageUrl,
  className,
}: TestAccountSelectRowProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2 overflow-hidden', className)}>
      <TestAccountAvatar
        name={name}
        email={email}
        imageUrl={imageUrl}
        size="xs"
        className="border"
      />
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden sm:gap-2">
        <span className="truncate text-sm font-medium">{name}</span>
        <span
          className="hidden shrink-0 text-muted-foreground/60 sm:inline"
          aria-hidden
        >
          ·
        </span>
        <span className="min-w-0 truncate text-xs text-muted-foreground sm:text-sm">
          {email}
        </span>
      </div>
    </div>
  );
}

'use client';

import { Building2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type CompanyLogoProps = {
  domain: string | null | undefined;
  size?: number;
  className?: string;
};

/** Clearbit logo with Building2 fallback on error or missing domain. */
export function CompanyLogo({ domain, size = 20, className }: CompanyLogoProps) {
  const [err, setErr] = useState(false);

  if (!domain || err) {
    return (
      <Building2
        style={{ width: size, height: size }}
        className={cn('shrink-0 text-muted-foreground', className)}
      />
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 rounded-sm object-contain', className)}
      onError={() => setErr(true)}
    />
  );
}

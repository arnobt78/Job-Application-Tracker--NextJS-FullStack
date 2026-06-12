'use client';

import { SafeImage } from '@/components/ui/safe-image';
import { resolveAvatarUrl } from '@/lib/auth/avatar-url';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type TestAccountAvatarProps = {
  name: string;
  email: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  /** Preload image into browser cache when URL resolves */
  preload?: boolean;
};

const SIZE_PX = { xs: 24, sm: 32, md: 48, lg: 80 } as const;

/** Circle avatar for test accounts — Clerk URL or robohash fallback */
export function TestAccountAvatar({
  name,
  email,
  imageUrl,
  size = 'md',
  className,
  preload = false,
}: TestAccountAvatarProps) {
  const [avatarError, setAvatarError] = useState(false);
  const px = SIZE_PX[size];
  const src = resolveAvatarUrl({
    imageUrl,
    name,
    email,
    avatarError,
  });

  useEffect(() => {
    if (!preload || !src) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [preload, src]);

  return (
    <div
      className={cn(
        'shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted',
        className
      )}
      style={{ width: px, height: px }}
    >
      <SafeImage
        src={src}
        alt={name}
        width={px}
        height={px}
        className="h-full w-full object-cover"
        onError={() => setAvatarError(true)}
      />
    </div>
  );
}

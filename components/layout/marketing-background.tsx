'use client';

import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

type MarketingBackgroundProps = {
  src: string;
  alt?: string;
  className?: string;
};

/** Full-section blurred JPG backdrop — decorative, HealthCal-style depth */
export function MarketingBackground({
  src,
  alt = '',
  className,
}: MarketingBackgroundProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden
    >
      <SafeImage
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover opacity-40 blur-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90" />
    </div>
  );
}

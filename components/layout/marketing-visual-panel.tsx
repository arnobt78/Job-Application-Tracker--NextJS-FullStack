'use client';

import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

type MarketingVisualPanelProps = {
  src: string;
  alt: string;
  accentSrc?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Glass image panel — width follows grid column (no fixed max-w).
 * Aspect ratio fluid; caps height on tall viewports.
 */
export function MarketingVisualPanel({
  src,
  alt,
  accentSrc,
  priority = false,
  className,
  style,
}: MarketingVisualPanelProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-background/20 shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-xl',
        className
      )}
      style={style}
    >
      <div className="relative aspect-[4/3] w-full max-h-[min(70vh,520px)] sm:aspect-[5/4] lg:aspect-[4/3]">
        <SafeImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {accentSrc ? (
        <div className="absolute bottom-4 right-4 h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-background/60 p-2 shadow-lg backdrop-blur-md sm:h-16 sm:w-16">
          <SafeImage
            src={accentSrc}
            alt=""
            width={48}
            height={48}
            className="h-full w-full object-contain"
            aria-hidden
          />
        </div>
      ) : null}
    </div>
  );
}

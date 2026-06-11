'use client';

import { SafeImage } from '@/components/ui/safe-image';
import {
  HERO_CAROUSEL_SVGS,
  HERO_FRAME_MAIN,
} from '@/lib/ui/marketing-assets';
import { cn } from '@/lib/utils';
import { useEffect, useState, useSyncExternalStore } from 'react';

const CAROUSEL_INTERVAL_MS = 4000;

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * Hero visual — glass frame with main.svg (left) + crossfading job-1..4 carousel (right).
 * Width follows grid column; no fixed max-width.
 */
export function HeroIllustrationFrame({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_CAROUSEL_SVGS.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-[28px] border border-white/10 bg-background/20 shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-xl',
        className
      )}
    >
      <div className="relative flex aspect-[4/3] w-full max-h-[min(70vh,520px)] flex-col sm:flex-row">
        {/* Static main illustration */}
        <div className="relative flex min-h-[180px] flex-1 items-center justify-center border-white/10 p-4 sm:min-h-0 sm:border-r">
          <SafeImage
            src={HERO_FRAME_MAIN}
            alt="Jobify career journey illustration"
            width={320}
            height={320}
            priority
            className="h-full max-h-[240px] w-auto object-contain sm:max-h-none"
          />
        </div>

        {/* Cycling job SVG carousel */}
        <div className="relative flex flex-1 items-center justify-center p-4">
          {HERO_CAROUSEL_SVGS.map((src, index) => (
            <SafeImage
              key={src}
              src={src}
              alt=""
              width={280}
              height={280}
              aria-hidden={index !== activeIndex}
              className={cn(
                'absolute inset-4 object-contain transition-opacity duration-700 ease-in-out',
                index === activeIndex ? 'opacity-100' : 'opacity-0'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

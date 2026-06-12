'use client';

import { SafeImage } from '@/components/ui/safe-image';
import {
  HERO_CAROUSEL_INTERVAL_MS,
  HERO_CAROUSEL_SLIDES,
} from '@/lib/ui/marketing-assets';
import { cn } from '@/lib/utils';
import { useEffect, useState, useSyncExternalStore } from 'react';

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * Hero visual — one large image at a time (main.svg + job-1..4).
 * No border frame; dynamic colored glow behind each slide.
 */
export function HeroVisualCarousel({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );

  const slide = HERO_CAROUSEL_SLIDES[activeIndex];

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length);
    }, HERO_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center',
        'min-h-[min(55vh,480px)] sm:min-h-[min(65vh,560px)]',
        className
      )}
    >
      {/* Dynamic glow — color shifts with active slide */}
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full blur-3xl transition-[background,opacity] duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, ${slide.glow} 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="relative aspect-square w-full max-w-[min(100%,720px)] min-h-[min(50vh,420px)]">
        {HERO_CAROUSEL_SLIDES.map((item, index) => (
          <SafeImage
            key={item.src}
            src={item.src}
            alt={index === activeIndex ? item.alt : ''}
            width={640}
            height={640}
            priority={index === 0}
            loading={
              index === 0
                ? undefined
                : index === activeIndex
                  ? 'eager'
                  : 'lazy'
            }
            aria-hidden={index !== activeIndex}
            className={cn(
              'absolute inset-0 h-full w-full object-contain transition-all duration-700 ease-in-out',
              index === activeIndex
                ? 'scale-100 opacity-100'
                : 'pointer-events-none scale-95 opacity-0'
            )}
          />
        ))}
      </div>
    </div>
  );
}

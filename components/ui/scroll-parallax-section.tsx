'use client';

import { cn } from '@/lib/utils';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

type ScrollParallaxSectionProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Section wrapper — scroll-linked translate only (no opacity dimming) */
export function ScrollParallaxSection({
  id,
  children,
  className,
}: ScrollParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [translateY, setTranslateY] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );

  useEffect(() => {
    if (reduceMotion) return;

    const update = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setTranslateY((rect.top - vh * 0.35) * 0.08);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [reduceMotion]);

  return (
    <section
      id={id}
      ref={ref}
      className={cn('relative scroll-mt-14', className)}
    >
      <div
        className="transition-transform duration-300 ease-out motion-reduce:transform-none"
        style={
          reduceMotion ? undefined : { transform: `translateY(${translateY}px)` }
        }
      >
        {children}
      </div>
    </section>
  );
}

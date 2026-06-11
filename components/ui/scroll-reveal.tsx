'use client';

import {
  getReducedMotionSnapshot,
  SCROLL_REVEAL_HIDDEN_CLASS,
  SCROLL_REVEAL_ITEM_CLASS,
  SCROLL_REVEAL_VISIBLE_CLASS,
  subscribeReducedMotion,
} from '@/lib/ui/scroll-motion';
import { cn } from '@/lib/utils';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms when used inside a shared trigger */
  delay?: number;
  style?: CSSProperties;
};

/** Single-item viewport reveal — respects prefers-reduced-motion */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [intersected, setIntersected] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const visible = prefersReducedMotion || intersected;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIntersected(entry?.isIntersecting ?? false),
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className={cn(
        SCROLL_REVEAL_ITEM_CLASS,
        visible ? SCROLL_REVEAL_VISIBLE_CLASS : SCROLL_REVEAL_HIDDEN_CLASS,
        className
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms', ...style }}
    >
      {children}
    </div>
  );
}

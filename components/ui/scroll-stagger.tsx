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
  Children,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

type ScrollStaggerVariant = 'rise' | 'fade';

type ScrollStaggerProps = {
  children: ReactNode;
  /** Delay between each child in ms */
  staggerMs?: number;
  className?: string;
  itemClassName?: string;
  /** Above-the-fold chrome (navbar) — stagger on mount */
  triggerOnMount?: boolean;
  /** fade = opacity only (navbar/footer chrome) */
  variant?: ScrollStaggerVariant;
  /** IntersectionObserver rootMargin — e.g. footer needs bottom slack */
  rootMargin?: string;
};

/**
 * Viewport-triggered stair-step reveal — one IntersectionObserver per group.
 * Children animate in sequence when the group enters view; reverses on scroll away.
 */
const HIDDEN_BY_VARIANT: Record<ScrollStaggerVariant, string> = {
  rise: SCROLL_REVEAL_HIDDEN_CLASS,
  fade: 'opacity-0',
};

const VISIBLE_BY_VARIANT: Record<ScrollStaggerVariant, string> = {
  rise: SCROLL_REVEAL_VISIBLE_CLASS,
  fade: 'opacity-100',
};

export function ScrollStagger({
  children,
  staggerMs = 120,
  className,
  itemClassName,
  triggerOnMount = false,
  variant = 'rise',
  rootMargin = '0px 0px -4% 0px',
}: ScrollStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const visible = prefersReducedMotion || active;

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (triggerOnMount) {
      const id = window.setTimeout(() => setActive(true), 40);
      return () => window.clearTimeout(id);
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry?.isIntersecting ?? false),
      { threshold: 0.05, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion, triggerOnMount, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            SCROLL_REVEAL_ITEM_CLASS,
            visible
              ? VISIBLE_BY_VARIANT[variant]
              : HIDDEN_BY_VARIANT[variant],
            itemClassName
          )}
          style={{
            transitionDelay: visible ? `${index * staggerMs}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

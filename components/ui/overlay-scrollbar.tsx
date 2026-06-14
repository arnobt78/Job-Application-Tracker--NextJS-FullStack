'use client';

import { useEffect } from 'react';

const SCROLL_IDLE_MS = 800;

/** Mark scroll container so overlay thumb CSS can show during activity */
function markElementScrolling(el: Element) {
  el.classList.add('is-scrolling');
}

function clearElementScrolling(el: Element) {
  el.classList.remove('is-scrolling');
}

/**
 * Toggles `is-scrolling` during scroll activity for overlay thumb visibility.
 * Pair with `scrollbar-gutter: stable` in globals.css — gutter holds space, track stays transparent.
 */
export function OverlayScrollbar() {
  useEffect(() => {
    const idleTimers = new Map<Element, ReturnType<typeof setTimeout>>();

    const scheduleClear = (el: Element) => {
      const existing = idleTimers.get(el);
      if (existing) clearTimeout(existing);
      idleTimers.set(
        el,
        setTimeout(() => {
          clearElementScrolling(el);
          idleTimers.delete(el);
        }, SCROLL_IDLE_MS)
      );
    };

    const handleScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target === document.documentElement || target === document.body) {
        markElementScrolling(document.documentElement);
        scheduleClear(document.documentElement);
        return;
      }

      if (target.classList.contains('overlay-scroll')) {
        markElementScrolling(target);
        scheduleClear(target);
      }
    };

    /* capture: scroll does not bubble — capture catches nested scroll containers */
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
      idleTimers.forEach((timer) => clearTimeout(timer));
      idleTimers.clear();
      document.documentElement.classList.remove('is-scrolling');
      document.querySelectorAll('.overlay-scroll.is-scrolling').forEach((el) => {
        el.classList.remove('is-scrolling');
      });
    };
  }, []);

  return null;
}

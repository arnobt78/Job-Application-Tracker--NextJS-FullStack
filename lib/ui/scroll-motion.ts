/** Shared scroll-reveal motion tokens — used by ScrollStagger */

export const SCROLL_REVEAL_ITEM_CLASS =
  'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0';

export const SCROLL_REVEAL_HIDDEN_CLASS = 'translate-y-8 opacity-0';
export const SCROLL_REVEAL_VISIBLE_CLASS = 'translate-y-0 opacity-100';

export function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

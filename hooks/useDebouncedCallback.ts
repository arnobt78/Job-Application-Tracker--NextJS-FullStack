'use client';

import { useCallback, useEffect, useRef } from 'react';

/** Debounce a callback — used for instant search URL updates without flooding navigation */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delayMs: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs]
  ) as T;
}

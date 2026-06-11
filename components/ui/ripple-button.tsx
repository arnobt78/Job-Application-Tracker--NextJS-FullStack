'use client';

import { cn } from '@/lib/utils';
import {
  forwardRef,
  useCallback,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from 'react';

export type RippleButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Click ripple effect — client-only to avoid hydration mismatch */
export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  function RippleButton({ className, onClick, children, ...props }, ref) {
    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        button.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), {
          once: true,
        });

        onClick?.(event);
      },
      [onClick]
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn('relative overflow-hidden', className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

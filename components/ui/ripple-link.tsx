'use client';

import Link from 'next/link';
import {
  forwardRef,
  useCallback,
  type ComponentProps,
  type MouseEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';

export type RippleLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants>;

/** Link styled as Button with click ripple (RIPPLE_BUTTON_EFFECT.md) */
export const RippleLink = forwardRef<HTMLAnchorElement, RippleLinkProps>(
  function RippleLink(
    { className, variant, size, href, onClick, children, ...props },
    ref
  ) {
    const handleClick = useCallback(
      (event: MouseEvent<HTMLAnchorElement>) => {
        const anchor = event.currentTarget;
        const rect = anchor.getBoundingClientRect();
        const rippleSize = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - rippleSize / 2;
        const y = event.clientY - rect.top - rippleSize / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        anchor.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), {
          once: true,
        });

        onClick?.(event);
      },
      [onClick]
    );

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          buttonVariants({ variant, size }),
          'relative overflow-hidden',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

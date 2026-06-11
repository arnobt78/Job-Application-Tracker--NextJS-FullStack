'use client';

import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Children, type ReactNode } from 'react';

type StaggerGroupProps = {
  children: ReactNode;
  /** Base delay between each child in ms */
  staggerMs?: number;
  className?: string;
  itemClassName?: string;
};

/** Wraps children with incrementing ScrollReveal delays (stair-step) */
export function StaggerGroup({
  children,
  staggerMs = 120,
  className,
  itemClassName,
}: StaggerGroupProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <ScrollReveal
          key={index}
          delay={index * staggerMs}
          className={itemClassName}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}

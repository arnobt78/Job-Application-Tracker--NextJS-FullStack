'use client';

import { ScrollStagger } from '@/components/ui/scroll-stagger';
import { type ReactNode } from 'react';

type StaggerGroupProps = {
  children: ReactNode;
  staggerMs?: number;
  className?: string;
  itemClassName?: string;
};

/** Alias for ScrollStagger — grid/card stair-step on viewport enter */
export function StaggerGroup({
  children,
  staggerMs = 120,
  className,
  itemClassName,
}: StaggerGroupProps) {
  return (
    <ScrollStagger
      staggerMs={staggerMs}
      className={className}
      itemClassName={itemClassName}
    >
      {children}
    </ScrollStagger>
  );
}

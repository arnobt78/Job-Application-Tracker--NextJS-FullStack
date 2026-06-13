'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type GlassSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};

/** Glass search field with leading icon — used for instant dashboard filtering */
export function GlassSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  id,
}: GlassSearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input flex h-10 w-full rounded-2xl border py-2 pl-9 pr-3 text-sm shadow-[0_12px_40px_rgba(2,132,199,0.15)] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  );
}

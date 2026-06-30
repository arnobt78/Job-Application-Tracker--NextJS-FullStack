'use client';

import type { ReactNode } from 'react';
import {
  Briefcase,
  CalendarCheck,
  Clock,
  Filter,
  XCircle,
} from 'lucide-react';
import { JobMode } from '@/utils/types';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GlassDropdownContent,
  GlassDropdownRadioItem,
  GlassDropdownTrigger,
} from '@/components/ui/glass-dropdown-menu';
import type { FilterOption } from '@/lib/jobs/filter-config';
import { cn } from '@/lib/utils';

const FIELD_GLOW = 'shadow-[0_12px_40px_rgba(2,132,199,0.15)]';

const statusIcons: Record<string, ReactNode> = {
  all: <Filter className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4 text-amber-400" />,
  interview: <CalendarCheck className="h-4 w-4 text-emerald-400" />,
  declined: <XCircle className="h-4 w-4 text-rose-400" />,
};

const modeIcons: Record<string, ReactNode> = {
  all: <Briefcase className="h-4 w-4" />,
  [JobMode.FullTime]: <Briefcase className="h-4 w-4" />,
  [JobMode.PartTime]: <Clock className="h-4 w-4" />,
  [JobMode.Internship]: <Briefcase className="h-4 w-4" />,
};

/** Icon for job status filter/form dropdown row */
export function getJobStatusOptionIcon(value: string): ReactNode {
  return statusIcons[value] ?? statusIcons.all;
}

/** Icon for job mode filter/form dropdown row */
export function getJobModeOptionIcon(value: string): ReactNode {
  return modeIcons[value] ?? modeIcons.all;
}

type GlassFilterDropdownProps = {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  triggerIcon: ReactNode;
  triggerLabel: string;
  align?: 'start' | 'center' | 'end';
  getOptionIcon?: (value: string) => ReactNode;
  className?: string;
};

/**
 * Shared glass filter dropdown — dashboard filter row + job form dialogs.
 * modal=false avoids scroll-lock layout shift.
 */
export function GlassFilterDropdown({
  value,
  options,
  onChange,
  triggerIcon,
  triggerLabel,
  align = 'start',
  getOptionIcon,
  className,
}: GlassFilterDropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <GlassDropdownTrigger className={cn(FIELD_GLOW, className)}>
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-muted-foreground">{triggerIcon}</span>
            <span className="truncate">{triggerLabel}</span>
          </span>
        </GlassDropdownTrigger>
      </DropdownMenuTrigger>
      <GlassDropdownContent
        align={align}
        collisionPadding={8}
        sideOffset={8}
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <GlassDropdownRadioItem
              key={option.value}
              value={option.value}
              label={option.label}
              icon={getOptionIcon?.(option.value)}
            />
          ))}
        </DropdownMenuRadioGroup>
      </GlassDropdownContent>
    </DropdownMenu>
  );
}

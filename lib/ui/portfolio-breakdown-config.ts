import type { LucideIcon } from 'lucide-react';
import type { StatsResult } from '@/lib/jobs/queries';
import {
  Briefcase,
  CalendarCheck,
  Clock,
  GraduationCap,
  XCircle,
} from 'lucide-react';

export type PortfolioBreakdownField = keyof Pick<
  StatsResult,
  'pending' | 'interview' | 'declined' | 'fullTime' | 'partTime' | 'internship'
>;

export type PortfolioBreakdownItem = {
  label: string;
  field: PortfolioBreakdownField;
  icon: LucideIcon;
  iconClassName: string;
};

/** Global portfolio breakdown labels + icons — stable chrome for dashboard toolbar */
export const PORTFOLIO_BREAKDOWN_ITEMS: PortfolioBreakdownItem[] = [
  {
    label: 'Pending',
    field: 'pending',
    icon: Clock,
    iconClassName: 'text-ink-amber',
  },
  {
    label: 'Interview',
    field: 'interview',
    icon: CalendarCheck,
    iconClassName: 'text-ink-emerald',
  },
  {
    label: 'Declined',
    field: 'declined',
    icon: XCircle,
    iconClassName: 'text-ink-rose',
  },
  {
    label: 'Full-time',
    field: 'fullTime',
    icon: Briefcase,
    iconClassName: 'text-muted-foreground',
  },
  {
    label: 'Part-time',
    field: 'partTime',
    icon: Clock,
    iconClassName: 'text-muted-foreground',
  },
  {
    label: 'Internship',
    field: 'internship',
    icon: GraduationCap,
    iconClassName: 'text-muted-foreground',
  },
];

import { AreaChart, AppWindow } from 'lucide-react';

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

/**
 * Legacy nav links array — used by LinksDropdown (kept but superseded by DashboardNav).
 * Hrefs updated to new /dashboard route.
 */
const links: NavLink[] = [
  {
    href: '/dashboard',
    label: 'all jobs',
    icon: <AppWindow />,
  },
  {
    href: '/stats',
    label: 'stats',
    icon: <AreaChart />,
  },
];

export default links;

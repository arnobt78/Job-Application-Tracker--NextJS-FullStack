'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavShell } from '@/components/layout/nav-shell';
import { SiteLogo } from '@/components/layout/site-logo';
import ThemeToggle from '@/components/ThemeToggle';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlignLeft, BarChart2, Compass, LayoutDashboard } from 'lucide-react';
import { NotificationBell } from '@/components/layout/notification-bell';
import { cn } from '@/lib/utils';

/** Dashboard nav links — logo links here, active state tracked by pathname */
const NAV_LINKS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: '/stats',
    label: 'Stats',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    href: '/discover',
    label: 'Discover',
    icon: <Compass className="h-4 w-4" />,
  },
] as const;

/**
 * Full dashboard top navbar — replaces legacy Navbar + Sidebar.
 * Logo left (links /dashboard) | nav pill links center (md+) | ThemeToggle + avatar right.
 * Mobile: hamburger dropdown for nav links.
 */
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <NavShell>
      {/* Left — logo linked to /dashboard */}
      <Link
        href="/dashboard"
        className="flex h-full shrink-0 items-center rounded-lg transition hover:opacity-90"
        aria-label="Go to dashboard"
      >
        <SiteLogo priority linked={false} />
      </Link>

      {/* Center — pill nav links, visible md+ */}
      <nav
        className="hidden h-full items-center gap-0.5 md:flex"
        aria-label="Dashboard navigation"
      >
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === '/dashboard'
              ? pathname === '/dashboard' || pathname.startsWith('/dashboard/')
              : pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition',
                isActive
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'text-foreground/75 hover:bg-white/10 hover:text-foreground'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right — mobile hamburger + ThemeToggle + avatar */}
      <div className="flex items-center gap-2">
        {/* Mobile nav — hamburger dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <AlignLeft className="h-4 w-4" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={10} className="w-44">
            {NAV_LINKS.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href} className="flex items-center gap-2">
                  {link.icon}
                  {link.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationBell />
        <ThemeToggle />
        {/* Avatar with glow — UserProfileDropdown manages its own ring */}
        <div className="rounded-full shadow-sm shadow-primary/20 ring-1 ring-primary/10">
          <UserProfileDropdown />
        </div>
      </div>
    </NavShell>
  );
}

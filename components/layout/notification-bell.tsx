'use client';

/**
 * Notification bell — shows unread badge + popover list of enrichment alerts.
 * Consumes useNotifications() from NotificationsProvider (dashboard layout).
 */

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, type AppNotification } from '@/context/notifications-context';
import { cn } from '@/lib/utils';

const NOTIFICATION_LABELS: Record<AppNotification['notificationType'], string> = {
  posting_closed: 'Posting closed',
  jd_changed: 'Job description changed',
  salary_added: 'Salary disclosed',
  posting_reopened: 'Posting reopened',
  interview_prep_ready: 'Interview prep ready',
};

function NotificationItem({ notification }: { notification: AppNotification }) {
  const label = NOTIFICATION_LABELS[notification.notificationType] ?? 'Update';
  const time = new Date(notification.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 px-3 py-2 text-sm',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{label}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
      </div>
      <p className="line-clamp-2 text-muted-foreground">{notification.message}</p>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="max-h-80 w-72 overflow-y-auto"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </p>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

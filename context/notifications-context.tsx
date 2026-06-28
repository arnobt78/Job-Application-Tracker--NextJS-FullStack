'use client';

/**
 * Notifications context — accumulates enrichment alert notifications pushed via SSE.
 *
 * Architecture:
 *   SSE (/api/jobs/events) → useJobsCacheSync → BroadcastChannel 'jobify-notifications'
 *                                                          ↓
 *                                               NotificationsProvider subscribes here
 *
 * No second SSE connection: useJobsCacheSync (in QueryProvider) relays 'notify' events
 * to the NOTIFICATIONS_CHANNEL BroadcastChannel, which NotificationsProvider reads.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import { NOTIFICATIONS_CHANNEL } from '@/hooks/useJobsCacheSync';
import type { JobsNotificationEvent } from '@/lib/jobs-events';

export type AppNotification = JobsNotificationEvent & {
  /** Client-side unique ID for React key and markRead targeting */
  id: string;
  read: boolean;
};

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const MAX_NOTIFICATIONS = 50;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!isSignedIn || typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const bc = new BroadcastChannel(NOTIFICATIONS_CHANNEL);

    const handler = (event: MessageEvent<unknown>) => {
      const data = event.data as { type?: string };
      if (data?.type !== 'notify') return;
      const n = data as JobsNotificationEvent;
      idRef.current += 1;
      setNotifications((prev) => [
        { ...n, id: `notif-${idRef.current}`, read: false },
        ...prev.slice(0, MAX_NOTIFICATIONS - 1),
      ]);
    };

    bc.addEventListener('message', handler);

    return () => {
      bc.removeEventListener('message', handler);
      bc.close();
    };
  }, [isSignedIn]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    []
  );

  const markRead = useCallback(
    (id: string) =>
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      ),
    []
  );

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

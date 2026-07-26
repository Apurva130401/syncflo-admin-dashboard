import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification, NotificationCategory, NotificationPriority, NotificationType } from '@/types/notification';
import { createClient } from '@/lib/supabase/client';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  readIds: string[];
  dismissedIds: string[];
  isLoading: boolean;
  lastSyncedAt: string | null;
  
  // Real Supabase Data Actions
  fetchRealNotifications: () => Promise<void>;
  initRealtimeSubscription: () => () => void;

  addNotification: (
    data: Omit<Notification, 'id' | 'timestamp' | 'read'> & {
      id?: string;
      timestamp?: Date | string;
      read?: boolean;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markRouteAsRead: (pathname: string) => void;
  markAllAsRead: (category?: NotificationCategory) => void;
  removeNotification: (id: string) => void;
  removeBatch: (ids: string[]) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      readIds: [],
      dismissedIds: [],
      isLoading: false,
      lastSyncedAt: null,

      fetchRealNotifications: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/admin/notifications');
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          const data = await response.json();
          const rawNotifications: Notification[] = data.notifications || [];

          const { readIds, dismissedIds } = get();
          const readSet = new Set(readIds);
          const dismissedSet = new Set(dismissedIds);

          const processed = rawNotifications
            .filter((n) => !dismissedSet.has(n.id))
            .map((n) => ({
              ...n,
              read: readSet.has(n.id) ? true : n.read,
            }));

          const unread = processed.filter((n) => !n.read).length;

          set({
            notifications: processed,
            unreadCount: unread,
            isLoading: false,
            lastSyncedAt: data.syncedAt || new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error fetching real Supabase notifications:', error);
          set({ isLoading: false });
        }
      },

      initRealtimeSubscription: () => {
        if (typeof window === 'undefined') return () => {};

        const supabase = createClient();
        
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'support_tickets' },
            (payload: { new: Record<string, any> }) => {
              const newTicket = payload.new;
              get().addNotification({
                id: `ticket-${newTicket.id}`,
                title: `New Support Ticket #${newTicket.id?.slice(0, 6) || ''}`,
                message: newTicket.subject || 'New support request submitted',
                type: 'error',
                category: 'support',
                priority: 'high',
                actionUrl: '/dashboard/support-tickets',
              });
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'business_verification' },
            (payload: { new: Record<string, any> }) => {
              const newVerif = payload.new;
              get().addNotification({
                id: `verification-${newVerif.id}`,
                title: `New Verification: ${newVerif.business_name || 'Business'}`,
                message: 'New identity document uploaded for review',
                type: 'info',
                category: 'users',
                priority: 'medium',
                actionUrl: '/dashboard/verifications',
              });
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'contact_submissions' },
            (payload: { new: Record<string, any> }) => {
              const newSub = payload.new;
              get().addNotification({
                id: `inquiry-${newSub.id}`,
                title: `New Inquiry from ${newSub.name || 'Customer'}`,
                message: newSub.subject || 'New website message received',
                type: 'info',
                category: 'support',
                priority: 'medium',
                actionUrl: '/dashboard/inquiries',
              });
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'admin_tasks' },
            (payload: { new: Record<string, any> }) => {
              const newTask = payload.new;
              get().addNotification({
                id: `task-${newTask.id}`,
                title: `New Task Assigned: ${newTask.title || 'Task'}`,
                message: `Priority: ${newTask.priority || 'medium'}`,
                type: 'warning',
                category: 'tasks',
                priority: newTask.priority || 'medium',
                actionUrl: '/dashboard/tasks',
              });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },

      addNotification: (data) => {
        const newNotification: Notification = {
          id: data.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          category: data.category || 'system',
          priority: data.priority || 'medium',
          timestamp: data.timestamp
            ? typeof data.timestamp === 'string'
              ? data.timestamp
              : data.timestamp.toISOString()
            : new Date().toISOString(),
          read: data.read ?? false,
          actionUrl: data.actionUrl,
          meta: data.meta,
        };

        set((state) => {
          const exists = state.notifications.some((n) => n.id === newNotification.id);
          if (exists) return state;

          const updated = [newNotification, ...state.notifications];
          const unread = updated.filter((n) => !n.read).length;
          return { notifications: updated, unreadCount: unread };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const readSet = new Set(state.readIds);
          readSet.add(id);

          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const unread = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            unreadCount: unread,
            readIds: Array.from(readSet),
          };
        });
      },

      markRouteAsRead: (pathname) => {
        set((state) => {
          if (!pathname || state.notifications.length === 0) return state;

          let hasChanges = false;
          const readSet = new Set(state.readIds);

          const updated = state.notifications.map((n) => {
            if (n.read) return n;

            const isMatch =
              (n.actionUrl && (n.actionUrl === pathname || pathname.startsWith(n.actionUrl))) ||
              (pathname === '/dashboard/users' && n.category === 'users') ||
              (pathname === '/dashboard/support-tickets' && n.category === 'support') ||
              (pathname === '/dashboard/inquiries' && (n.category === 'support' || n.id.startsWith('inquiry-'))) ||
              (pathname === '/dashboard/custom-enquiries' && n.id.startsWith('inquiry-')) ||
              (pathname === '/dashboard/verifications' && (n.category === 'users' || n.id.startsWith('verification-'))) ||
              (pathname === '/dashboard/tasks' && n.category === 'tasks') ||
              (pathname === '/dashboard/monitoring' && n.category === 'system') ||
              (pathname === '/dashboard/logs' && n.category === 'security') ||
              (pathname === '/dashboard/crm' && n.category === 'crm') ||
              ((pathname === '/dashboard/invoices' || pathname === '/dashboard/subscriptions' || pathname === '/dashboard/revenue' || pathname === '/dashboard/payroll') && n.category === 'finance');

            if (isMatch) {
              hasChanges = true;
              readSet.add(n.id);
              return { ...n, read: true };
            }
            return n;
          });

          if (!hasChanges) return state;

          const unread = updated.filter((n) => !n.read).length;
          return {
            notifications: updated,
            unreadCount: unread,
            readIds: Array.from(readSet),
          };
        });
      },

      markAllAsRead: (category) => {
        set((state) => {
          const readSet = new Set(state.readIds);

          const updated = state.notifications.map((n) => {
            if (category && n.category !== category) return n;
            readSet.add(n.id);
            return { ...n, read: true };
          });
          const unread = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            unreadCount: unread,
            readIds: Array.from(readSet),
          };
        });
      },

      removeNotification: (id) => {
        set((state) => {
          const dismissedSet = new Set(state.dismissedIds);
          dismissedSet.add(id);

          const updated = state.notifications.filter((n) => n.id !== id);
          const unread = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            unreadCount: unread,
            dismissedIds: Array.from(dismissedSet),
          };
        });
      },

      removeBatch: (ids) => {
        set((state) => {
          const dismissedSet = new Set(state.dismissedIds);
          ids.forEach((id) => dismissedSet.add(id));

          const idSet = new Set(ids);
          const updated = state.notifications.filter((n) => !idSet.has(n.id));
          const unread = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            unreadCount: unread,
            dismissedIds: Array.from(dismissedSet),
          };
        });
      },

      clearAll: () => {
        set((state) => {
          const dismissedSet = new Set(state.dismissedIds);
          state.notifications.forEach((n) => dismissedSet.add(n.id));

          return {
            notifications: [],
            unreadCount: 0,
            dismissedIds: Array.from(dismissedSet),
          };
        });
      },
    }),
    {
      name: 'syncflo-admin-real-notifications-v2',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        readIds: state.readIds,
        dismissedIds: state.dismissedIds,
      }),
    }
  )
);

// Global helper for firing notifications locally or in hooks
export function triggerNotification(
  title: string,
  message: string,
  options?: {
    category?: NotificationCategory;
    priority?: NotificationPriority;
    type?: NotificationType;
    actionUrl?: string;
    meta?: Record<string, any>;
  }
) {
  useNotificationStore.getState().addNotification({
    title,
    message,
    category: options?.category || 'system',
    priority: options?.priority || 'medium',
    type: options?.type || 'info',
    actionUrl: options?.actionUrl,
    meta: options?.meta,
  });
}
import { create } from 'zustand';
import { Notification, NotificationState } from '@/types/notification';

interface NotificationStore extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notificationData,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notificationToRemove = state.notifications.find((n) => n.id === id);
      const wasUnread = notificationToRemove && !notificationToRemove.read;

      return {
        notifications: state.notifications.filter((notification) => notification.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    set(() => ({
      notifications: [],
      unreadCount: 0,
    }));
  },
}));
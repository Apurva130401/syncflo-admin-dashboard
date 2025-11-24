'use client'
import { useNotificationStore } from '@/hooks/use-notifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell } from 'lucide-react';
import { Notification } from '@/types/notification';

export function NotificationPanel() {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex items-center p-4 border-b border-gray-200">
        <Bell className="h-6 w-6 text-gray-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
      </div>
      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center">No new notifications</p>
          ) : (
            notifications.slice(0, 5).map((notification: Notification) => (
              <div key={notification.id} className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{notification.message}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

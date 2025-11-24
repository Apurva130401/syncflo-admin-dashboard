'use client'
import { useState } from 'react'
import { Notification } from '@/types/notification'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, X, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NotificationDropdownProps {
   notifications: Notification[]
   onMarkAsRead: (id: string) => void
   onMarkAllAsRead: () => void
   onClose: () => void
   onDismiss?: (id: string) => void
}

export function NotificationDropdown({
   notifications,
   onMarkAsRead,
   onMarkAllAsRead,
   onClose,
   onDismiss
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✕'
      default: return 'ℹ'
    }
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs h-7 px-2"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-1">
                            {notification.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => window.open(notification.actionUrl, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkAsRead(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (onDismiss) {
                                  onDismiss(notification.id);
                                } else {
                                  // Fallback: just mark as read
                                  onMarkAsRead(notification.id);
                                }
                              }}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
      </div>
    </div>
  )
}
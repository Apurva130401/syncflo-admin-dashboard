'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Notification, NotificationCategory } from '@/types/notification'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  CheckCheck,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Target,
  DollarSign,
  Users,
  CheckSquare,
  Activity,
  ArrowRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClose: () => void
  onDismiss?: (id: string) => void
}

const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  system: Activity,
  support: HelpCircle,
  crm: Target,
  finance: DollarSign,
  users: Users,
  tasks: CheckSquare,
  security: ShieldAlert,
}

const CATEGORY_LABELS: Record<NotificationCategory | 'all', string> = {
  all: 'All',
  system: 'System',
  support: 'Support',
  crm: 'CRM',
  finance: 'Finance',
  users: 'Users',
  tasks: 'Tasks',
  security: 'Security',
}

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  onDismiss
}: NotificationDropdownProps) {
  const [activeTab, setActiveTab] = useState<NotificationCategory | 'all'>('all')

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications
    return notifications.filter(n => n.category === activeTab)
  }, [notifications, activeTab])

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-rose-500/15 text-rose-700 border-rose-200 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5">Critical</Badge>
      case 'high':
        return <Badge className="bg-amber-500/15 text-amber-800 border-amber-200 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5">High</Badge>
      case 'medium':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] uppercase font-semibold px-1.5 py-0.5">Med</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] px-1.5 py-0.5">Low</Badge>
    }
  }

  const getTypeStyle = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      case 'warning':
        return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'error':
        return 'bg-rose-50 text-rose-600 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  const formatTime = (ts: Date | string) => {
    try {
      const dateObj = typeof ts === 'string' ? new Date(ts) : ts
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch (e) {
      return 'just now'
    }
  }

  return (
    <div className="w-96 bg-white rounded-xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden max-h-[580px] text-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-900 text-white shadow-sm">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base leading-none">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-extrabold bg-rose-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">All activity & operational alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs h-8 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-3 scrollbar-none">
          {(['all', 'system', 'support', 'finance', 'users', 'tasks', 'security'] as const).map((cat) => {
            const count = cat === 'all' 
              ? notifications.filter(n => !n.read).length
              : notifications.filter(n => n.category === cat && !n.read).length

            const isActive = activeTab === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px]">
        {filteredNotifications.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-30 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700">No notifications found</p>
            <p className="text-xs text-slate-400 mt-1">You are all caught up for {CATEGORY_LABELS[activeTab]}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComp = CATEGORY_ICONS[notification.category] || Activity
            return (
              <div
                key={notification.id}
                className={`p-3.5 transition-all hover:bg-slate-50 relative group ${
                  !notification.read ? 'bg-slate-50/80 font-medium' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border flex-shrink-0 ${getTypeStyle(notification.type)}`}>
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs font-bold leading-tight ${!notification.read ? 'text-slate-950' : 'text-slate-700'}`}>
                          {notification.title}
                        </h4>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-1">
                      <span className="text-[11px] text-slate-400">
                        {formatTime(notification.timestamp)}
                      </span>
                      <div className="flex items-center gap-1">
                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            onClick={onClose}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded"
                            title="Open action"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Mark read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (onDismiss) onDismiss(notification.id)
                            else onMarkAsRead(notification.id)
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500">{notifications.length} total notifications</span>
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="text-slate-950 hover:text-slate-700 flex items-center gap-1 font-bold transition-colors"
        >
          <span>View All Page</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
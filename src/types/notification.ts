export type NotificationCategory = 'system' | 'support' | 'crm' | 'finance' | 'users' | 'tasks' | 'security'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  timestamp: Date | string
  read: boolean
  actionUrl?: string
  meta?: Record<string, any>
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}
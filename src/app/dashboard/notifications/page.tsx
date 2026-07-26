'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useNotificationStore } from '@/hooks/use-notifications'
import { NotificationCategory } from '@/types/notification'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Zap,
  RotateCcw,
  Check,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Target,
  DollarSign,
  Users,
  CheckSquare,
  Activity,
  Clock,
  AlertTriangle,
  RefreshCw,
  Database,
  Radio,
  Server
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_MAP: Record<NotificationCategory, { label: string; icon: React.ElementType; color: string }> = {
  system: { label: 'System', icon: Activity, color: 'text-slate-700 bg-slate-100 border-slate-200' },
  support: { label: 'Support', icon: HelpCircle, color: 'text-violet-700 bg-violet-50 border-violet-200' },
  crm: { label: 'CRM', icon: Target, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  finance: { label: 'Finance', icon: DollarSign, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  users: { label: 'Users', icon: Users, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  tasks: { label: 'Tasks', icon: CheckSquare, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  security: { label: 'Security', icon: ShieldAlert, color: 'text-rose-700 bg-rose-50 border-rose-200' },
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    lastSyncedAt,
    fetchRealNotifications,
    initRealtimeSubscription,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeBatch,
    clearAll
  } = useNotificationStore()

  // Initialize Realtime Supabase Data
  useEffect(() => {
    fetchRealNotifications()
    const unsubscribe = initRealtimeSubscription()
    return () => {
      unsubscribe()
    }
  }, [fetchRealNotifications, initRealtimeSubscription])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filtered Notifications calculation
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        searchQuery === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory
      const matchesPriority = selectedPriority === 'all' || n.priority === selectedPriority
      const matchesRead =
        readFilter === 'all' ||
        (readFilter === 'unread' && !n.read) ||
        (readFilter === 'read' && n.read)

      return matchesSearch && matchesCategory && matchesPriority && matchesRead
    })
  }, [notifications, searchQuery, selectedCategory, selectedPriority, readFilter])

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredNotifications.map((n) => n.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleBulkMarkRead = () => {
    selectedIds.forEach((id) => markAsRead(id))
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    removeBatch(selectedIds)
    setSelectedIds([])
  }

  const formatTime = (ts: Date | string) => {
    try {
      const dateObj = typeof ts === 'string' ? new Date(ts) : ts
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch (e) {
      return 'just now'
    }
  }

  const criticalCount = notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-white rounded-xl shadow-md">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Live Supabase Notifications
              </h1>
              <p className="text-slate-500 mt-0.5 text-sm font-medium">
                Real database events & live alerts from Support, Verifications, Inquiries, Tasks, System Health, and Users
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRealNotifications()}
            disabled={isLoading}
            className="gap-2 text-slate-800 font-bold border-slate-300 hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              className="gap-2 text-slate-700 font-semibold hover:bg-slate-100"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              Mark All Read ({unreadCount})
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Live Alerts</p>
              <p className="text-3xl font-extrabold text-slate-950 mt-1">{notifications.length}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
              <Bell className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Unread Alerts</p>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">{unreadCount}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">High / Critical</p>
              <p className="text-3xl font-extrabold text-amber-700 mt-1">{criticalCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Database Engine</p>
              <p className="text-3xl font-extrabold text-slate-950 mt-1">Supabase DB</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Database className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Notification List, Right Realtime Connection Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Notification Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Live Database Feed</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Real-time alerts synced from Supabase tables</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-8 w-48 bg-white border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex items-center gap-2 flex-wrap pt-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8 text-xs w-36 bg-white border-slate-200">
                    <Filter className="h-3 w-3 mr-1 text-slate-400" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="system">System Health</SelectItem>
                    <SelectItem value="support">Support & Inquiries</SelectItem>
                    <SelectItem value="crm">CRM Leads</SelectItem>
                    <SelectItem value="finance">Subscriptions & Billing</SelectItem>
                    <SelectItem value="users">User Verifications</SelectItem>
                    <SelectItem value="tasks">Admin Tasks</SelectItem>
                    <SelectItem value="security">Security & Logs</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="h-8 text-xs w-32 bg-white border-slate-200">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 ml-auto text-xs">
                  <button
                    onClick={() => setReadFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      readFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setReadFilter('unread')}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      readFilter === 'unread' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setReadFilter('read')}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      readFilter === 'read' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Read
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Bulk Action Toolbar */}
              {selectedIds.length > 0 && (
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between px-4 text-xs font-semibold">
                  <span>{selectedIds.length} item(s) selected</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleBulkMarkRead}
                      className="h-7 text-xs font-bold"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark Read
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="h-7 text-xs font-bold"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Header Checkbox */}
              {filteredNotifications.length > 0 && (
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <Checkbox
                    checked={
                      selectedIds.length === filteredNotifications.length &&
                      filteredNotifications.length > 0
                    }
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  />
                  <span>Select All Filtered ({filteredNotifications.length})</span>
                </div>
              )}

              {/* Feed List */}
              <div className="divide-y divide-slate-100">
                {isLoading && notifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-emerald-600" />
                    <p className="text-sm font-bold text-slate-800">Fetching live database events from Supabase...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-25 stroke-[1.5]" />
                    <p className="text-base font-bold text-slate-800">No notifications match your filters</p>
                    <p className="text-xs text-slate-500 mt-1">Check back soon or click "Sync Now" to reload from Supabase.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const catInfo = CATEGORY_MAP[notif.category] || CATEGORY_MAP.system
                    const IconComponent = catInfo.icon
                    const isSelected = selectedIds.includes(notif.id)

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 transition-all hover:bg-slate-50/80 flex items-start gap-3.5 ${
                          !notif.read ? 'bg-slate-50/50' : ''
                        } ${isSelected ? 'bg-slate-100/80' : ''}`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(notif.id)}
                          className="mt-1"
                        />

                        <div className={`p-2.5 rounded-xl border shrink-0 ${catInfo.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-sm font-bold leading-snug ${!notif.read ? 'text-slate-950' : 'text-slate-700'}`}>
                                {notif.title}
                              </h3>
                              <Badge className={`text-[10px] font-bold uppercase tracking-wider ${catInfo.color}`}>
                                {catInfo.label}
                              </Badge>
                              {notif.priority === 'critical' && (
                                <Badge className="bg-rose-500 text-white text-[10px] font-extrabold uppercase">Critical</Badge>
                              )}
                              {notif.priority === 'high' && (
                                <Badge className="bg-amber-500 text-white text-[10px] font-extrabold uppercase">High</Badge>
                              )}
                            </div>

                            <span className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap">
                              {formatTime(notif.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Item Footer Controls */}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/60 text-xs">
                            <div className="flex items-center gap-2">
                              {notif.actionUrl && (
                                <Link
                                  href={notif.actionUrl}
                                  className="inline-flex items-center gap-1 text-slate-900 font-bold hover:text-slate-700 hover:underline"
                                >
                                  <span>View Page</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {!notif.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notif.id)}
                                  className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 font-semibold"
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNotification(notif.id)}
                                className="h-7 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Real-Time Connection Status & DB Tables (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="bg-slate-950 text-white rounded-t-xl pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                Supabase Realtime Engine
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Connected to Supabase PostgreSQL Database
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-900 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Realtime Channel Active</span>
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-2">Connected Database Tables:</p>
                <ul className="space-y-1.5 text-slate-600">
                  <li className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">support_tickets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">business_verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">contact_submissions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">admin_tasks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">system_health</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">profiles</span>
                  </li>
                </ul>
              </div>

              {lastSyncedAt && (
                <div className="pt-3 border-t border-slate-100 text-slate-500">
                  <p className="text-[11px]">
                    Last synced with database: <span className="font-semibold text-slate-800">{formatTime(lastSyncedAt)}</span>
                  </p>
                </div>
              )}

              <Button
                onClick={() => fetchRealNotifications()}
                disabled={isLoading}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Syncing Supabase...' : 'Refresh Database Feed'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Search, User, Menu, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotificationStore } from '@/hooks/use-notifications'
import { NotificationDropdown } from '@/components/dashboard/notification-dropdown'
import { useAppShell } from './app-shell-context'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const { toggleMobile } = useAppShell()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore()

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 glass px-6 py-3 bg-white/85 backdrop-blur-md shadow-xs">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Trigger */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2 text-slate-600 hover:bg-slate-100 rounded-full"
          onClick={toggleMobile}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors h-4 w-4" />
            <Input
              type="text"
              placeholder="Search users, tickets, logs, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-100/90 border-transparent focus:border-slate-300 focus:bg-white transition-all rounded-xl text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* Notifications Popover */}
          <Popover open={isNotifOpen} onOpenChange={setIsNotifOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full focus-ring"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                    <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-60" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none bg-transparent shadow-none w-auto z-50" align="end" sideOffset={8}>
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={() => markAllAsRead()}
                onClose={() => setIsNotifOpen(false)}
                onDismiss={removeNotification}
              />
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-slate-300 transition-all p-0 overflow-hidden">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                  <AvatarFallback className="bg-slate-950 text-white font-bold text-xs">SA</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl p-1" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-slate-900">Admin Account</p>
                  <p className="text-xs leading-none text-slate-500">
                    admin@syncflo.xyz
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem asChild className="focus:bg-slate-100 cursor-pointer rounded-lg p-2 text-sm font-semibold">
                <Link href="/dashboard/settings">
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-100 cursor-pointer rounded-lg p-2 text-sm font-semibold">
                <Link href="/dashboard/notifications">
                  <Bell className="mr-2 h-4 w-4 text-slate-500" />
                  <span>All Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-100 cursor-pointer rounded-lg p-2 text-sm font-semibold">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>System Preferences</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                className="focus:bg-rose-50 focus:text-rose-700 cursor-pointer text-rose-600 rounded-lg p-2 text-sm font-semibold"
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
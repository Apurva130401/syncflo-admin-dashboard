'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Settings, LogOut, User, Menu } from 'lucide-react'

import { useAppShell } from '@/components/layout/app-shell-context'
import { useUser } from '@/providers/user-provider'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const { user, profile } = useUser()
  const { toggleMobile } = useAppShell()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const displayName = profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.user_metadata?.name || 'User'
  const userEmail = user?.email || 'No email provided'
  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 md:hidden"
              onClick={toggleMobile}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200">
                    <AvatarImage src={userAvatar} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-b from-slate-900 to-slate-800 text-white font-semibold">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white border border-gray-200 shadow-xl rounded-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-gray-900">{displayName}</p>
                    <p className="text-xs leading-none text-gray-500">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="px-4 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 cursor-pointer">
                  <User className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium">Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="px-4 py-3 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 cursor-pointer">
                  <Settings className="mr-3 h-4 w-4 text-gray-600" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="px-4 py-3 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer text-red-600">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

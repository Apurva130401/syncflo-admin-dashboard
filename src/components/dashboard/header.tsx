'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Settings, LogOut, User, Menu, Search, Sparkles } from 'lucide-react'

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
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/78 shadow-[0_14px_44px_-36px_rgba(15,23,42,0.55)] backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 md:hidden"
              onClick={toggleMobile}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  Live workspace
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <h1 className="mt-0.5 truncate text-lg font-bold text-slate-950">
                Admin Command Center
              </h1>
            </div>
          </div>

          <div className="hidden min-w-[280px] max-w-md flex-1 items-center rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-slate-400 shadow-inner shadow-slate-200/30 lg:flex">
            <Search className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Search users, tickets, invoices...</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
              <span className="text-xs font-bold text-emerald-800">Systems normal</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100">
                  <Avatar className="h-10 w-10 ring-2 ring-slate-200 transition-all duration-200 hover:ring-emerald-300">
                    <AvatarImage src={userAvatar} alt={displayName} />
                    <AvatarFallback className="bg-slate-950 font-semibold text-white">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10" align="end" forceMount>
                <DropdownMenuLabel className="border-b border-slate-200 bg-slate-50 p-4 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-slate-950">{displayName}</p>
                    <p className="text-xs leading-none text-slate-500">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700">
                  <User className="mr-3 h-4 w-4 text-emerald-600" />
                  <span className="font-medium">Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-700">
                  <Settings className="mr-3 h-4 w-4 text-slate-600" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer px-4 py-3 text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700">
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

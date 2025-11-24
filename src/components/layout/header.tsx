'use client'

import { useState } from 'react'
import { Bell, Search, User, Menu } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 glass px-6 py-3 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Trigger (Hidden on Desktop) */}
        <Button variant="ghost" size="icon" className="md:hidden mr-2 text-muted-foreground">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-100 border-transparent focus:border-primary/50 focus:bg-white transition-all rounded-xl text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all p-0 overflow-hidden">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback className="bg-primary/20 text-primary">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border-slate-200 text-slate-900 shadow-lg" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900">John Doe</p>
                  <p className="text-xs leading-none text-slate-500">
                    john.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="focus:bg-slate-100 focus:text-slate-900 cursor-pointer hover:bg-slate-50">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-100 focus:text-slate-900 cursor-pointer hover:bg-slate-50">
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="focus:bg-red-50 focus:text-red-600 cursor-pointer text-red-500 hover:bg-red-50">
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { useAppShell } from './app-shell-context'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppShell()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 text-slate-900 relative">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300 w-full",
        "md:pl-0", 
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
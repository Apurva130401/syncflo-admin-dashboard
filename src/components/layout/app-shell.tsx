'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { useAppShell } from './app-shell-context'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppShell()

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <main className="flex-1 overflow-y-auto p-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
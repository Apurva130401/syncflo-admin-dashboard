'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { useAppShell } from './app-shell-context'
import { cn } from '@/lib/utils'
import { Header } from '@/components/dashboard/header'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppShell()

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#f7f8fb] text-slate-900">
      <Sidebar />
      <div className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-out",
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1680px] animate-soft-in px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

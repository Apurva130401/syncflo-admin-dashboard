'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface DashboardLayoutProps {
  children: ReactNode
}

import { AppShell } from '@/components/layout/app-shell'
import { UserProvider } from '@/providers/user-provider'

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <UserProvider>
      <AppShell>
        <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col")}>
          {/* Header */}
          <Header />
          {/* Main Content Area */}
          <main className="flex-1 p-4 overflow-auto">
            {children}
          </main>
        </div>
      </AppShell>
    </UserProvider>
  )
}
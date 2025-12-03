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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [supabase])

  return (
    <AppShell>
      <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col")}>
        {/* Header */}
        <Header user={user} />
        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </AppShell>
  )
}
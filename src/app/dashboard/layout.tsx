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
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile && profile.role === 'user') {
          window.location.href = '/' // Redirect restricted users
          return
        }
        setUser(user)
      }
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
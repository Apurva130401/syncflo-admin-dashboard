'use client'

import { useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { AppShellProvider } from '@/components/layout/app-shell-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <AppShellProvider>
      {children}
    </AppShellProvider>
  )
}

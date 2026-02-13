'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { AppShellProvider } from '@/components/layout/app-shell-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth checks on public routes to prevent redirect loops
    const publicRoutes = ['/login', '/unauthorized']
    const isPublicRoute = publicRoutes.includes(pathname)

    const checkAdminAccess = async () => {
      if (isPublicRoute) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/unauthorized')
        return
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN' && !isPublicRoute) {
        await checkAdminAccess()
      }
    })

    // Initial check
    checkAdminAccess()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, pathname])

  return (
    <AppShellProvider>
      {children}
    </AppShellProvider>
  )
}
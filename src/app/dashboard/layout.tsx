import { AppShell } from '@/components/layout/app-shell'
import { UserProvider } from '@/providers/user-provider'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <UserProvider>
      <AppShell>
        {children}
      </AppShell>
    </UserProvider>
  )
}

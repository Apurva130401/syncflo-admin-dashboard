import { ReactNode, useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'

// Define a type for the user object that this component will receive
interface PageContainerProps {
  children: ReactNode
  user: {
    email?: string
    user_metadata?: {
      name?: string
      avatar_url?: string
    }
  } | null
  className?: string
}

export function PageContainer({ children, user, className }: PageContainerProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}


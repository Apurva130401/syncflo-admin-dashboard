'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { OverviewVerifications } from '@/components/dashboard/overview-verifications'
import { OverviewTickets } from '@/components/dashboard/overview-tickets'
import { EmployeeDashboard } from '@/components/dashboard/employee/employee-dashboard'
import { AttendanceWidget } from '@/components/dashboard/employee/attendance-widget'
import { PipelineChart } from '@/components/dashboard/crm/pipeline-chart'
import { RecentPayroll } from '@/components/dashboard/payroll/recent-payroll'

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    openTickets: 0,
    pendingVerifications: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user session
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Get Role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          setRole(profile?.role || 'user')
        }

        // If Employee, we don't need admin stats.
        // We can optimize fetching but keeping it simple for now.

        // Get users count
        const usersResponse = await fetch('/api/admin/users')
        const usersResult = await usersResponse.json()
        const totalUsers = usersResult.users?.length || 0

        // Get active users
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const activeUsers = usersResult.users?.filter((u: any) =>
          new Date(u.updated_at) > thirtyDaysAgo
        ).length || 0

        // Get verifications count
        const verificationsResponse = await fetch('/api/admin/verifications')
        const verificationsResult = await verificationsResponse.json()
        const pendingVerifications = verificationsResult.verifications?.filter(
          (v: any) => v.status === 'pending'
        ).length || 0

        // Get tickets count
        const ticketsResponse = await fetch('/api/admin/support-tickets')
        const ticketsResult = await ticketsResponse.json()
        const openTickets = ticketsResult.tickets?.filter(
          (t: any) => t.status === 'open'
        ).length || 0

        setStats({
          totalUsers,
          activeUsers,
          openTickets,
          pendingVerifications
        })

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-slate-500">Loading dashboard...</div>
  }

  // --- ROLE BASED RENDER ---

  if (role === 'employee') {
    return <EmployeeDashboard user={user} />
  }

  // Default / Admin / Manager / Support View
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Key Metrics */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">

        {/* Left Column (Operational Widgets) */}
        <div className="lg:col-span-5 space-y-8">
          {role !== 'admin' && <AttendanceWidget />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PipelineChart />
            <RecentPayroll />
          </div>
        </div>

        {/* Right Column (Actions) */}
        <div className="lg:col-span-2 space-y-8">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
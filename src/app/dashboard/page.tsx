'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { AttendanceWidget } from '@/components/dashboard/employee/attendance-widget'
import { PipelineChart } from '@/components/dashboard/crm/pipeline-chart'
import { RecentPayroll } from '@/components/dashboard/payroll/recent-payroll'
import { EmployeeDashboard } from '@/components/dashboard/employee/employee-dashboard'
import { useUser } from '@/providers/user-provider'

export default function AdminDashboard() {
  const { user, profile, loading: userLoading } = useUser()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    openTickets: 0,
    pendingVerifications: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)

        // Fetch all stats in parallel //
        const [usersRes, verificationsRes, ticketsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/verifications'),
          fetch('/api/admin/support-tickets')
        ])

        const [usersResult, verificationsResult, ticketsResult] = await Promise.all([
          usersRes.json(),
          verificationsRes.json(),
          ticketsRes.json()
        ])

        const totalUsers = usersResult.users?.length || 0

        // Active users logic
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const activeUsers = usersResult.users?.filter((u: any) =>
          new Date(u.updated_at) > thirtyDaysAgo
        ).length || 0

        const pendingVerifications = verificationsResult.verifications?.filter(
          (v: any) => v.status === 'pending'
        ).length || 0

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
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    // Only fetch stats if user is admin/manager (optimization)
    // For now, fetching for everyone except if we want to be strict
    if (user) {
      fetchStats()
    }
  }, [user])

  // Show a full page loader ONLY if the user context is initializing
  // Once we know who the user is, we show the dashboard shell immediately
  if (userLoading) {
    return <div className="flex h-[50vh] items-center justify-center text-slate-500">Loading...</div>
  }

  const role = profile?.role || 'user'

  // --- ROLE BASED RENDER ---

  if (role === 'employee') {
    return <EmployeeDashboard user={user} />
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Key Metrics */}
      <StatsCards stats={stats} loading={statsLoading} />

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
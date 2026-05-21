'use client'

import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { AttendanceWidget } from '@/components/dashboard/employee/attendance-widget'
import { PipelineChart } from '@/components/dashboard/crm/pipeline-chart'
import { RecentPayroll } from '@/components/dashboard/payroll/recent-payroll'
import { EmployeeDashboard } from '@/components/dashboard/employee/employee-dashboard'
import { useUser } from '@/providers/user-provider'

type DashboardStats = {
  totalUsers: number
  activeUsers: number
  openTickets: number
  pendingVerifications: number
}

async function fetchDashboardJson<T>(url: string, fallback: T): Promise<T> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`)
    }

    return await response.json() as T
  } catch (error) {
    console.error(`Dashboard request failed for ${url}:`, error)
    return fallback
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export default function AdminDashboard() {
  const { user, profile, loading: userLoading } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
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

        const nextStats = await fetchDashboardJson<DashboardStats>('/api/admin/dashboard-stats', {
          totalUsers: 0,
          activeUsers: 0,
          openTickets: 0,
          pendingVerifications: 0,
        })

        setStats(nextStats)

      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    if (user && profile?.role && profile.role !== 'employee') {
      fetchStats()
    }
  }, [profile?.role, user])

  // Show a full page loader ONLY if the user context is initializing
  // Once we know who the user is, we show the dashboard shell immediately
  if (userLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-500 shadow-sm">
          Preparing your workspace...
        </div>
      </div>
    )
  }

  const role = profile?.role || 'user'

  // --- ROLE BASED RENDER ---

  if (role === 'employee') {
    return <EmployeeDashboard user={user} />
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Key Metrics */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-7">

        {/* Left Column (Operational Widgets) */}
        <div className="space-y-5 xl:col-span-5">
          {role !== 'admin' && <AttendanceWidget />}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PipelineChart />
            <RecentPayroll />
          </div>
        </div>

        {/* Right Column (Actions) */}
        <div className="space-y-5 xl:col-span-2">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

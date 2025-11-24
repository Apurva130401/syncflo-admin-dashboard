'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Ticket, Activity, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    openTickets: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get users count from API
        const usersResponse = await fetch('/api/admin/users')
        const usersResult = await usersResponse.json()
        const totalUsers = usersResult.users?.length || 0

        // Get active users (users updated in last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const activeUsers = usersResult.users?.filter((user: any) =>
          new Date(user.updated_at) > thirtyDaysAgo
        ).length || 0

        // Get support tickets count from API
        const ticketsResponse = await fetch('/api/admin/support-tickets')
        const ticketsResult = await ticketsResponse.json()
        const totalTickets = ticketsResult.tickets?.length || 0
        const openTickets = ticketsResult.tickets?.filter((ticket: any) =>
          ticket.status === 'open'
        ).length || 0

        setStats({
          totalUsers,
          activeUsers,
          totalTickets,
          openTickets,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Manage users and monitor system activity with real-time insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Support requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Pending resolution
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Activity monitoring coming soon...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">System monitoring coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { KeyMetrics } from '@/components/dashboard/key-metrics'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { SalesFunnelChart } from '@/components/dashboard/sales-funnel-chart'
import { Button } from '@/components/ui/button'
import { Download, Plus } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Overview of your key performance metrics and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="glass hover:bg-slate-100 border-slate-200 text-slate-700">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <KeyMetrics />

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Main Chart Area (Sales Funnel for now, could be a line chart) */}
        <div className="lg:col-span-4 space-y-8">
          <SalesFunnelChart />

          {/* Placeholder for another chart or widget */}
          <div className="glass rounded-xl p-6 border border-slate-200 min-h-[200px] flex items-center justify-center text-slate-400 bg-white/50">
            Additional Analytics Widget
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

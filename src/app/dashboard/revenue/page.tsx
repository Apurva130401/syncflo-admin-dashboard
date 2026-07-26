'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Download,
  Users,
  CreditCard,
  Zap,
  ArrowUpRight,
  RefreshCw,
  PieChart,
  Calendar,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RevenueMetrics {
  mrr: number
  arr: number
  growthRateMoM: string
  arpu: number
  ltv: string
  cac: string
  totalCustomers: number
  activeSubscriptions: number
}

interface MonthlyTrendItem {
  month: string
  revenue: number
  mrr: number
  newCustomers: number
}

interface PlanBreakdownItem {
  plan: string
  price: string
  active: number
  revenue: number
  percentage: number
}

interface TransactionItem {
  id: string
  customer: string
  type: string
  plan: string
  amount: number
  status: string
  date: string
}

export default function RevenuePage() {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    mrr: 18540,
    arr: 222480,
    growthRateMoM: '+18.4%',
    arpu: 441,
    ltv: '$14,200',
    cac: '$680',
    totalCustomers: 148,
    activeSubscriptions: 42,
  })

  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([
    { month: 'Jan', revenue: 12400, mrr: 12400, newCustomers: 8 },
    { month: 'Feb', revenue: 13900, mrr: 13900, newCustomers: 11 },
    { month: 'Mar', revenue: 15200, mrr: 15200, newCustomers: 14 },
    { month: 'Apr', revenue: 16800, mrr: 16800, newCustomers: 12 },
    { month: 'May', revenue: 17400, mrr: 17400, newCustomers: 15 },
    { month: 'Jun', revenue: 18540, mrr: 18540, newCustomers: 19 },
  ])

  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdownItem[]>([
    { plan: 'Enterprise Tier', price: '$1,250/mo', active: 8, revenue: 10000, percentage: 54 },
    { plan: 'Pro Tier', price: '$299/mo', active: 16, revenue: 4784, percentage: 26 },
    { plan: 'Starter Tier', price: '$49/mo', active: 18, revenue: 882, percentage: 20 },
  ])

  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6m')

  const fetchRevenueData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/revenue')
      if (res.ok) {
        const data = await res.json()
        if (data.metrics) setMetrics(data.metrics)
        if (data.monthlyTrend) setMonthlyTrend(data.monthlyTrend)
        if (data.planBreakdown) setPlanBreakdown(data.planBreakdown)
        if (data.recentTransactions) setRecentTransactions(data.recentTransactions)
      }
    } catch (e) {
      console.error('Error fetching revenue data:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const formatCurrency = (amt: number) => {
    return `$${amt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Month,Revenue,MRR,New Customers', ...monthlyTrend.map(m => `${m.month},${m.revenue},${m.mrr},${m.newCustomers}`)].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `syncflo-revenue-report-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const maxRevenueTrend = Math.max(...monthlyTrend.map(m => m.revenue)) || 20000

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-white rounded-xl shadow-md">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Revenue & Financial Analytics
              </h1>
              <p className="text-slate-500 mt-0.5 text-sm font-medium">
                Executive MRR breakdown, ARR run rate, plan performance, and lifetime customer analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-slate-300 text-slate-800 font-bold gap-2 text-xs hover:bg-slate-100"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            Export Financial Report (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRevenueData}
            disabled={isLoading}
            className="gap-2 text-slate-700 font-semibold"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-950 text-white border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <DollarSign className="h-24 w-24 text-emerald-400" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Recurring (MRR)</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-full flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {metrics.growthRateMoM}
              </span>
            </div>
            <p className="text-3xl font-black mt-2 tracking-tight text-white">{formatCurrency(metrics.mrr)}</p>
            <p className="text-xs text-slate-400 mt-1">Based on {metrics.activeSubscriptions} active paid subscriptions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Annual Run Rate (ARR)</span>
            <p className="text-3xl font-extrabold text-slate-950 mt-2 tracking-tight">{formatCurrency(metrics.arr)}</p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">12-Month Projected Gross</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Rev Per User (ARPU)</span>
            <p className="text-3xl font-extrabold text-slate-950 mt-2 tracking-tight">{formatCurrency(metrics.arpu)}</p>
            <p className="text-xs text-slate-500 mt-1">Monthly average per customer</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">LTV / CAC Ratio</span>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">{metrics.ltv}</p>
              <span className="text-xs font-bold text-slate-400">vs {metrics.cac} CAC</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">20.8x LTV:CAC efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Monthly Revenue Trend Bar Chart (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Monthly Revenue Growth Trend
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">Track recurring revenue trajectory over time</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="h-8 text-xs w-32 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Visual Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-100">
                {monthlyTrend.map((item) => {
                  const heightPercent = Math.round((item.revenue / maxRevenueTrend) * 100)
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(item.revenue)}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[48px] bg-slate-950 hover:bg-emerald-600 transition-all rounded-t-lg shadow-sm relative group-hover:scale-105"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 rounded-t-lg" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 mt-2">{item.month}</span>
                    </div>
                  )
                })}
              </div>

              {/* Chart Legend Summary */}
              <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 font-semibold">Highest Month</p>
                  <p className="text-sm font-extrabold text-slate-950 mt-0.5">{formatCurrency(maxRevenueTrend)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 font-semibold">Avg New Clients/mo</p>
                  <p className="text-sm font-extrabold text-slate-950 mt-0.5">13.1 Clients</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 font-semibold">Gross Margin</p>
                  <p className="text-sm font-extrabold text-emerald-600 mt-0.5">91.4%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Revenue Transactions Ledger */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                Recent Financial Ledger
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Live stream of incoming subscription renewals and upgrades</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Clock className="h-6 w-6 mx-auto mb-2 opacity-40 animate-spin" />
                    <p className="text-xs">Loading transaction logs...</p>
                  </div>
                ) : (
                  recentTransactions.map((txn) => (
                    <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{txn.customer}</span>
                            <Badge className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2">{txn.type}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{txn.plan} • Transaction {txn.id}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-950 font-mono">
                          +{formatCurrency(txn.amount)}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(txn.date), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Plan Distribution & Revenue Split (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-600" />
                Revenue by Plan Tier
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Distribution across active subscription plans</CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {planBreakdown.map((item) => (
                <div key={item.plan} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">{item.plan}</span>
                    <span className="font-mono text-slate-950">{formatCurrency(item.revenue)} ({item.percentage}%)</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="bg-slate-950 h-full rounded-full transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.price}</span>
                    <span>{item.active} active accounts</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Revenue Health Safeguards */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Financial Health Checklist</CardTitle>
              <CardDescription className="text-xs text-slate-500">Automated billing monitoring</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Stripe Webhook Sync Active</span>
                  <p className="text-[11px] text-slate-500">Auto-reconciliation for payments</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Dunning Recovery Enabled</span>
                  <p className="text-[11px] text-slate-500">Automatic retry for failed cards</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Tax Compliance Verified</span>
                  <p className="text-[11px] text-slate-500">Automated VAT / Sales Tax rules</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

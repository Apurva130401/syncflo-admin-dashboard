'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Ticket, ShieldCheck } from 'lucide-react'

import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardsProps {
    loading?: boolean
    stats?: {
        totalUsers: number
        activeUsers: number
        openTickets: number
        pendingVerifications: number
    }
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
    const cards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers?.toLocaleString() ?? 0,
            description: 'Registered accounts',
            icon: Users,
            trend: '+12% from last month',
            trendColor: 'text-emerald-600',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Active Users',
            value: stats?.activeUsers?.toLocaleString() ?? 0,
            description: 'Active in last 30 days',
            icon: Activity,
            trend: '+5% from last week',
            trendColor: 'text-emerald-600',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
        },
        {
            title: 'Open Tickets',
            value: stats?.openTickets?.toLocaleString() ?? 0,
            description: 'Pending resolution',
            icon: Ticket,
            trend: (stats?.openTickets ?? 0) > 0 ? 'Needs Attention' : 'All clear',
            trendColor: (stats?.openTickets ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
        {
            title: 'Pending Verifications',
            value: stats?.pendingVerifications?.toLocaleString() ?? 0,
            description: 'Requires review',
            icon: ShieldCheck,
            trend: (stats?.pendingVerifications ?? 0) > 0 ? 'Action Required' : 'All caught up',
            trendColor: (stats?.pendingVerifications ?? 0) > 0 ? 'text-blue-600 font-medium' : 'text-slate-500',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
                Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                cards.map((card) => (
                    <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow duration-200 border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${card.iconBg}`}>
                                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {card.description}
                            </p>
                            {card.trend && (
                                <p className={`text-xs mt-2 ${card.trendColor}`}>
                                    {card.trend}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}

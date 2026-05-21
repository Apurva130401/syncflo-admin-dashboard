'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Ticket, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

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
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            accent: 'from-emerald-500 to-teal-500',
        },
        {
            title: 'Active Users',
            value: stats?.activeUsers?.toLocaleString() ?? 0,
            description: 'Active in last 30 days',
            icon: Activity,
            trend: '+5% from last week',
            trendColor: 'text-emerald-600',
            iconBg: 'bg-sky-50',
            iconColor: 'text-emerald-600',
            accent: 'from-sky-500 to-cyan-500',
        },
        {
            title: 'Open Tickets',
            value: stats?.openTickets?.toLocaleString() ?? 0,
            description: 'Pending resolution',
            icon: Ticket,
            trend: (stats?.openTickets ?? 0) > 0 ? 'Needs Attention' : 'All clear',
            trendColor: (stats?.openTickets ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            accent: 'from-amber-500 to-orange-500',
        },
        {
            title: 'Pending Verifications',
            value: stats?.pendingVerifications?.toLocaleString() ?? 0,
            description: 'Requires review',
            icon: ShieldCheck,
            trend: (stats?.pendingVerifications ?? 0) > 0 ? 'Action Required' : 'All caught up',
            trendColor: (stats?.pendingVerifications ?? 0) > 0 ? 'text-rose-600 font-medium' : 'text-slate-500',
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-600',
            accent: 'from-rose-500 to-pink-500',
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {loading ? (
                Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="premium-card min-h-[168px]">
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
                cards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.42, delay: index * 0.06, ease: 'easeOut' }}
                    >
                    <Card className="premium-card interactive-lift min-h-[168px]">
                        <div className={`h-1 w-full bg-gradient-to-r ${card.accent}`} />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                            <CardTitle className="text-sm font-semibold text-slate-500">
                                {card.title}
                            </CardTitle>
                            <div className={`rounded-lg border border-white p-2 shadow-sm ${card.iconBg}`}>
                                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-normal text-slate-950">{card.value}</div>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                                {card.description}
                            </p>
                            {card.trend && (
                                <p className={`mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-sm ring-1 ring-slate-200/80 ${card.trendColor}`}>
                                    {(card.trend.includes('All') || card.trend.includes('+')) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                                    {card.trend}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    </motion.div>
                ))
            )}
        </div>
    )
}

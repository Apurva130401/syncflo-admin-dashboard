'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, ShieldCheck, BarChart3, Settings, Mail, Activity, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function QuickActions() {
    const actions = [
        {
            label: 'Add User',
            icon: UserPlus,
            href: '/dashboard/users?action=new',
            color: 'text-slate-950',
            bg: 'bg-amber-50',
            description: 'Invite a teammate',
        },
        {
            label: 'Verify Business',
            icon: ShieldCheck,
            href: '/dashboard/verifications',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            description: 'Review pending checks',
        },
        {
            label: 'View Reports',
            icon: BarChart3,
            href: '/dashboard/monitoring',
            color: 'text-sky-700',
            bg: 'bg-sky-50',
            description: 'Open performance',
        },
        {
            label: 'Support Tickets',
            icon: Mail,
            href: '/dashboard/support-tickets',
            color: 'text-indigo-700',
            bg: 'bg-indigo-50',
            description: 'Handle replies',
        },
        {
            label: 'System Health',
            icon: Activity,
            href: '/dashboard/monitoring',
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            description: 'Check uptime',
        },
        {
            label: 'Settings',
            icon: Settings,
            href: '/dashboard/settings',
            color: 'text-slate-600',
            bg: 'bg-slate-50',
            description: 'Tune workspace',
        },
    ]

    return (
        <Card className="premium-card h-full">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">The most common employee workflows, one tap away.</p>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/activity" aria-label="Open activity">
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {actions.map((action, index) => (
                    <Link key={action.label} href={action.href} className="block focus-ring">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.32, delay: index * 0.04 }}
                            className={`interactive-lift rounded-lg border border-slate-200/80 p-4 ${action.bg}`}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <action.icon className={`h-5 w-5 ${action.color}`} />
                                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="block text-sm font-bold text-slate-950">{action.label}</span>
                            <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{action.description}</span>
                        </motion.div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}

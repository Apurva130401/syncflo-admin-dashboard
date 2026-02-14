'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, ShieldCheck, BarChart3, FileText, Settings, Mail } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
    const actions = [
        {
            label: 'Add User',
            icon: UserPlus,
            href: '/dashboard/users?action=new',
            color: 'text-blue-600',
            bg: 'bg-blue-50 hover:bg-blue-100',
        },
        {
            label: 'Verify Business',
            icon: ShieldCheck,
            href: '/dashboard/verifications',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 hover:bg-emerald-100',
        },
        {
            label: 'View Reports',
            icon: BarChart3,
            href: '/dashboard/monitoring',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 hover:bg-indigo-100',
        },
        {
            label: 'Support Tickets',
            icon: Mail,
            href: '/dashboard/support-tickets',
            color: 'text-amber-600',
            bg: 'bg-amber-50 hover:bg-amber-100',
        },
        {
            label: 'System Health',
            icon: ActivityIcon, // Will define below or import
            href: '/dashboard/monitoring',
            color: 'text-rose-600',
            bg: 'bg-rose-50 hover:bg-rose-100',
        },
        {
            label: 'Settings',
            icon: Settings,
            href: '/dashboard/settings',
            color: 'text-slate-600',
            bg: 'bg-slate-50 hover:bg-slate-100',
        },
    ]

    return (
        <Card className="h-full shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {actions.map((action) => (
                    <Link key={action.label} href={action.href} className="block">
                        <div className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 ${action.bg}`}>
                            <action.icon className={`h-6 w-6 mb-2 ${action.color}`} />
                            <span className="text-xs font-semibold text-slate-700 text-center">{action.label}</span>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

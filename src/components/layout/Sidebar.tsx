'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
    LayoutDashboard,
    Users,
    Settings,
    BarChart3,
    CreditCard,
    FileText,
    LogOut,
    ChevronLeft,
    Activity,
    HelpCircle,
    MessageSquare,
    ShieldCheck,
    Target,
    ClipboardList,
    DollarSign,
    Code,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppShell } from './app-shell-context'

// Define all possible items with their required roles/permissions implicit in the logic
const allItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['all'] },

    // Growth / Employee
    { icon: Target, label: 'CRM', href: '/dashboard/crm', roles: ['employee', 'admin', 'manager'] },
    { icon: ClipboardList, label: 'My Tasks', href: '/dashboard/tasks', roles: ['employee', 'admin', 'manager'] },

    // Admin / Manager Stats
    { icon: Users, label: 'All Users', href: '/dashboard/users', roles: ['admin', 'manager', 'support'] },
    { icon: Activity, label: 'User Activity', href: '/dashboard/activity', roles: ['admin', 'manager'] },

    // Support / Verifications
    { icon: ShieldCheck, label: 'Verifications', href: '/dashboard/verifications', roles: ['admin', 'manager', 'support'] },
    { icon: Clock, label: 'Attendance', href: '/dashboard/admin/attendance', roles: ['admin', 'manager'] },
    { icon: HelpCircle, label: 'Support Tickets', href: '/dashboard/support-tickets', roles: ['admin', 'manager', 'support'] },
    { icon: MessageSquare, label: 'Inquiries', href: '/dashboard/inquiries', roles: ['admin', 'manager', 'support'] },

    // Finance
    { icon: FileText, label: 'Invoices', href: '/dashboard/invoices', roles: ['admin', 'accountant'] },
    { icon: DollarSign, label: 'Payroll', href: '/dashboard/payroll', roles: ['all'] },
    { icon: DollarSign, label: 'Revenue', href: '/dashboard/revenue', roles: ['admin', 'accountant'] },
    { icon: CreditCard, label: 'Subscriptions', href: '/dashboard/subscriptions', roles: ['admin', 'manager'] },

    // System
    { icon: BarChart3, label: 'System Monitoring', href: '/dashboard/monitoring', roles: ['admin', 'developer'] },
    { icon: Code, label: 'API & Logs', href: '/dashboard/logs', roles: ['admin', 'developer'] },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['all'] },
]

import { useUser } from '@/providers/user-provider'

export function Sidebar() {
    const pathname = usePathname()
    const { sidebarCollapsed, toggleSidebar } = useAppShell()
    const { profile } = useUser()

    const navItems = React.useMemo(() => {
        const role = profile?.role || 'user'

        return allItems.filter(item => {
            if (item.roles.includes('all')) return true
            if (item.roles.includes(role)) return true
            // Legacy mismatch handling: 'super_admin' treated as 'admin'
            if (role === 'super_admin' && item.roles.includes('admin')) return true
            return false
        })
    }, [profile])

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-white/10 bg-[#0f172a] text-slate-100",
                sidebarCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex h-full flex-col justify-between py-4">
                {/* Logo Area */}
                <div className={cn("flex items-center px-4 mb-8", sidebarCollapsed ? "justify-center" : "justify-between")}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="text-xl font-bold text-white">
                                SyncFlo
                            </span>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className={cn("hidden md:flex text-slate-400 hover:text-white hover:bg-white/10", sidebarCollapsed && "hidden")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                        : "text-slate-400 hover:text-white hover:bg-white/5",
                                    sidebarCollapsed && "justify-center px-2"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                                )}
                                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-400" : "group-hover:text-white")} />
                                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="px-2 space-y-2">
                    <button
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-200 text-slate-400 hover:text-red-400 hover:bg-red-500/10",
                            sidebarCollapsed && "justify-center px-2"
                        )}
                        onClick={async () => {
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            window.location.href = '/login'
                        }}
                    >
                        <LogOut className="h-5 w-5" />
                        {!sidebarCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    )
}

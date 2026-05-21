'use client'

import React from 'react'
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
    ChevronRight,
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

const navGroups = [
    { label: 'Command', items: ['Dashboard', 'CRM', 'My Tasks'] },
    { label: 'People', items: ['All Users', 'User Activity', 'Attendance'] },
    { label: 'Operations', items: ['Verifications', 'Support Tickets', 'Inquiries'] },
    { label: 'Finance', items: ['Invoices', 'Payroll', 'Revenue', 'Subscriptions'] },
    { label: 'System', items: ['System Monitoring', 'API & Logs', 'Settings'] },
]

import { useUser } from '@/providers/user-provider'

export function Sidebar() {
    const pathname = usePathname()
    const { sidebarCollapsed, toggleSidebar, mobileOpen, closeMobile } = useAppShell()
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

    const groupedNav = React.useMemo(() => (
        navGroups
            .map((group) => ({
                ...group,
                items: group.items
                    .map((label) => navItems.find((item) => item.label === label))
                    .filter(Boolean) as typeof navItems,
            }))
            .filter((group) => group.items.length > 0)
    ), [navItems])

    return (
        <>
        {/* Mobile Overlay */}
        {mobileOpen && (
            <div 
                className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden" 
                onClick={closeMobile}
            />
        )}
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-out border-r border-slate-200/80 bg-white/92 text-slate-900 shadow-[18px_0_48px_-38px_rgba(15,23,42,0.5)] backdrop-blur-xl",
                sidebarCollapsed ? "w-20" : "w-64",
                "md:translate-x-0", // Always show on desktop
                mobileOpen ? "translate-x-0" : "-translate-x-full" // Toggle on mobile
            )}
        >
            <div className="flex h-full flex-col justify-between py-4">
                {/* Logo Area */}
                <div className={cn("mb-6 flex items-center px-4", sidebarCollapsed ? "justify-center" : "justify-between")}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-sm shadow-slate-900/20">
                                S
                            </div>
                            <div>
                                <span className="block text-base font-bold leading-tight text-slate-950">SyncFlo</span>
                                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Admin OS</span>
                            </div>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-sm shadow-slate-900/20">
                            S
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className={cn("hidden text-slate-400 hover:bg-slate-100 hover:text-slate-950 md:flex", sidebarCollapsed && "hidden")}
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-3">
                    {sidebarCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="mx-auto hidden text-slate-400 hover:bg-slate-100 hover:text-slate-950 md:flex"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                    {groupedNav.map((group) => (
                        <div key={group.label} className="space-y-1.5">
                            {!sidebarCollapsed && (
                                <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    {group.label}
                                </p>
                            )}
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                                return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={sidebarCollapsed ? item.label : undefined}
                                    className={cn(
                                        "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus-ring",
                                        isActive
                                            ? "bg-slate-950 text-white shadow-sm shadow-slate-900/10"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                                        sidebarCollapsed && "justify-center px-2"
                                    )}
                                    onClick={closeMobile}
                                >
                                    {isActive && (
                                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400" />
                                    )}
                                    <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700")} />
                                    {!sidebarCollapsed && <span className="font-semibold">{item.label}</span>}
                            </Link>
                        )
                    })}
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="space-y-3 px-3">
                    {!sidebarCollapsed && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold text-slate-950">Today’s focus</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Resolve priority queues and keep customer handoffs tight.</p>
                        </div>
                    )}
                    <button
                        className={cn(
                            "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus-ring",
                            sidebarCollapsed && "justify-center px-2"
                        )}
                        onClick={async () => {
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            window.location.href = '/login'
                        }}
                    >
                        <LogOut className="h-5 w-5 text-slate-400" />
                        {!sidebarCollapsed && <span className="font-semibold">Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
        </>
    )
}

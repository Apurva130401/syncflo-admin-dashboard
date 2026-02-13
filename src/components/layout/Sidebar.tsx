'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
    Layers,
    Activity,
    HelpCircle,
    MessageSquare,
    ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppShell } from './app-shell-context'

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'All Users', href: '/dashboard/users' },
    { icon: CreditCard, label: 'Subscriptions', href: '/dashboard/subscriptions' },
    { icon: Activity, label: 'User Activity', href: '/dashboard/activity' },
    { icon: ShieldCheck, label: 'Verifications', href: '/dashboard/verifications' },
    { icon: HelpCircle, label: 'Support Tickets', href: '/dashboard/support-tickets' },
    { icon: MessageSquare, label: 'Inquiries', href: '/dashboard/inquiries' },
    { icon: BarChart3, label: 'System Monitoring', href: '/dashboard/monitoring' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar() {
    const pathname = usePathname()
    const { sidebarCollapsed, toggleSidebar } = useAppShell()

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
                <nav className="flex-1 px-2 space-y-2">
                    {sidebarItems.map((item) => {
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

                                {/* Tooltip for collapsed state could go here */}
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
                    >
                        <LogOut className="h-5 w-5" />
                        {!sidebarCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    )
}

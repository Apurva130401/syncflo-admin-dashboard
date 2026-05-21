'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { AttendanceWidget } from '@/components/dashboard/employee/attendance-widget'
import { MiniCRMWidget } from '@/components/dashboard/employee/mini-crm-widget'
import { MyTasksWidget } from '@/components/dashboard/employee/my-tasks-widget'
import { User } from '@supabase/supabase-js'

interface EmployeeDashboardProps {
    user: User | null
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
    return (
        <div className="space-y-5">
            <DashboardHeader user={user} />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="space-y-5">
                    <AttendanceWidget />
                    <MyTasksWidget />
                </div>

                <div className="xl:col-span-2">
                    <MiniCRMWidget />
                    <div className="premium-card mt-5 rounded-lg p-5 text-center">
                        <p className="text-sm font-bold text-slate-700">Team Calendar & Announcements</p>
                        <p className="mt-1 text-xs text-slate-500">Upcoming shifts, launches, and handoffs will live here.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader user={user} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Attendance & Tasks */}
                <div className="space-y-8">
                    <AttendanceWidget />
                    <MyTasksWidget />
                </div>

                {/* Center/Right: CRM spans 2 cols */}
                <div className="md:col-span-2">
                    <MiniCRMWidget />
                    {/* Placeholder for Calendar or other widgets */}
                    <div className="mt-8 p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                        <p>Team Calendar & Announcements coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

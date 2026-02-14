'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

interface DashboardHeaderProps {
    user: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const [greeting, setGreeting] = useState('')

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good morning')
        else if (hour < 18) setGreeting('Good afternoon')
        else setGreeting('Good evening')
    }, [])

    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                    {greeting}, {firstName}
                </h1>
                <p className="text-slate-500 mt-1 text-lg">
                    Here's what's happening with your platform today.
                </p>
            </div>
            <div className="flex items-center gap-4 text-slate-500 bg-white p-2 rounded-lg border shadow-xs">
                <div className="flex items-center gap-2 px-3 py-1 border-r">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{format(new Date(), 'h:mm a')}</span>
                </div>
            </div>
        </div>
    )
}

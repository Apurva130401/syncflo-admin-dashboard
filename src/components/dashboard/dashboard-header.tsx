'use client'

import { User } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { Calendar, Clock, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardHeaderProps {
    user: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="premium-card mb-6 rounded-lg p-5 sm:p-6"
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Secure admin workspace
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                            <Zap className="h-3.5 w-3.5" />
                            Operational overview
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                        {greeting}, {firstName}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Your priority queues, platform health, and revenue operations are organized for fast decisions today.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2 rounded-lg border border-slate-200 bg-white/80 p-2 text-slate-600 shadow-sm sm:w-auto sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 rounded-md px-3 py-2">
                        <Calendar className="h-4 w-4 text-emerald-700" />
                        <span className="text-sm font-semibold">{format(new Date(), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="hidden h-8 w-px bg-slate-200 sm:block" />
                    <div className="flex items-center gap-2 rounded-md px-3 py-2">
                        <Clock className="h-4 w-4 text-sky-700" />
                        <span className="text-sm font-semibold">{format(new Date(), 'h:mm a')}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

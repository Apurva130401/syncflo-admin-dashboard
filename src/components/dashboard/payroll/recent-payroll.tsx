'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type PayrollRow = {
    id: string
    user_id: string
    month: string
    currency: string | null
    net_salary: number | string
    status: string
    created_at?: string
}

type PayrollProfile = {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
}

type PayrollWithUser = PayrollRow & {
    user?: PayrollProfile
}

export function RecentPayroll() {
    const [payroll, setPayroll] = useState<PayrollWithUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            // Fetch last 5 payroll records with user details
            // We need to fetch payroll then users manually as per our previous pattern to avoid join errors
            const { data: payrollData } = await supabase
                .from('admin_payroll')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            const rows = (payrollData || []) as PayrollRow[]

            if (rows.length > 0) {
                const userIds = [...new Set(rows.map((r) => r.user_id))]
                const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)

                const profileRows = (profiles || []) as PayrollProfile[]
                const profileMap = profileRows.reduce<Record<string, PayrollProfile>>((acc, p) => {
                    acc[p.id] = p
                    return acc
                }, {})

                const combined = rows.map((r) => ({
                    ...r,
                    user: profileMap[r.user_id]
                }))
                setPayroll(combined)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) return <Card className="premium-card h-[350px] animate-pulse bg-slate-100" />

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.06, ease: 'easeOut' }}
        >
        <Card className="premium-card col-span-1 h-full">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Recent Payroll</CardTitle>
                    <CardDescription>Latest salary payments</CardDescription>
                </div>
                <Link href="/dashboard/payroll" className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {payroll.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
                            <WalletCards className="mb-3 h-8 w-8 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-600">No payroll records found.</p>
                            <p className="mt-1 text-xs text-slate-400">New payments will appear here.</p>
                        </div>
                    ) : (
                        payroll.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.28, delay: index * 0.04 }}
                                className="interactive-lift flex items-center justify-between rounded-lg border border-slate-200 bg-white/76 p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-2 ring-white">
                                        <AvatarFallback className="bg-sky-50 font-bold text-sky-700">
                                            {item.user?.first_name?.[0] || item.user?.email?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {item.user?.first_name ? `${item.user.first_name} ${item.user.last_name || ''}` : item.user?.email}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {format(new Date(item.month + '-01'), 'MMMM yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-950">
                                        {item.currency || 'USD'} {item.net_salary}
                                    </p>
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${item.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {item.status}
                                    </Badge>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
        </motion.div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function RecentPayroll() {
    const [payroll, setPayroll] = useState<any[]>([])
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

            if (payrollData && payrollData.length > 0) {
                const userIds = [...new Set(payrollData.map((r: any) => r.user_id))]
                const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)

                const profileMap = (profiles || []).reduce((acc: any, p: any) => {
                    acc[p.id] = p
                    return acc
                }, {})

                const combined = payrollData.map((r: any) => ({
                    ...r,
                    user: profileMap[r.user_id]
                }))
                setPayroll(combined)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) return <Card className="h-[350px] animate-pulse bg-slate-100" />

    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Payroll</CardTitle>
                    <CardDescription>Latest salary payments</CardDescription>
                </div>
                <Link href="/dashboard/payroll" className="text-sm text-blue-600 hover:underline flex items-center">
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {payroll.length === 0 ? (
                        <p className="text-sm text-slate-500">No payroll records found.</p>
                    ) : (
                        payroll.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-blue-100 text-blue-600">
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
                                    <p className="text-sm font-bold text-slate-900">
                                        {item.currency || 'USD'} {item.net_salary}
                                    </p>
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${item.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {item.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

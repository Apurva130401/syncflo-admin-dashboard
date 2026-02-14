'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { createClient } from '@/lib/supabase/client'

const COLORS = ['#94a3b8', '#60a5fa', '#3b82f6', '#2563eb', '#16a34a']

export function PipelineChart() {
    const [data, setData] = useState<{ name: string; value: number; totalValue: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: leads } = await supabase.from('admin_leads').select('status, value')

            if (leads) {
                const stages = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Closed']
                const grouped = stages.map(stage => ({
                    name: stage,
                    value: leads.filter((l: any) => l.status === stage).length,
                    totalValue: leads.filter((l: any) => l.status === stage).reduce((acc, curr: any) => acc + (Number(curr.value) || 0), 0)
                }))
                setData(grouped)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) return <Card className="h-[350px] animate-pulse bg-slate-100" />

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Deal Pipeline</CardTitle>
                <CardDescription>Distribution of deals by stage</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

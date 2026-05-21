'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const COLORS = ['#cbd5e1', '#38bdf8', '#2563eb', '#4f46e5', '#059669']

type LeadSummary = {
    status: string | null
    value: number | string | null
}

export function PipelineChart() {
    const [data, setData] = useState<{ name: string; value: number; totalValue: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: leads } = await supabase.from('admin_leads').select('status, value')

            if (leads) {
                const leadRows = leads as LeadSummary[]
                const stages = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Closed']
                const grouped = stages.map(stage => ({
                    name: stage,
                    value: leadRows.filter((lead) => lead.status === stage).length,
                    totalValue: leadRows
                        .filter((lead) => lead.status === stage)
                        .reduce((acc: number, curr) => acc + (Number(curr.value) || 0), 0)
                }))
                setData(grouped)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) return <Card className="premium-card h-[350px] animate-pulse bg-slate-100" />

    const totalDeals = data.reduce((sum, stage) => sum + stage.value, 0)
    const totalValue = data.reduce((sum, stage) => sum + stage.totalValue, 0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
        >
        <Card className="premium-card col-span-1 h-full">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Deal Pipeline</CardTitle>
                    <CardDescription>Distribution of deals by stage</CardDescription>
                </div>
                <div className="rounded-lg border border-sky-100 bg-sky-50 p-2 text-sky-700">
                    <TrendingUp className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
                        <p className="text-xs font-semibold text-slate-500">Total deals</p>
                        <p className="mt-1 text-xl font-bold text-slate-950">{totalDeals}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
                        <p className="text-xs font-semibold text-slate-500">Pipeline value</p>
                        <p className="mt-1 text-xl font-bold text-slate-950">${totalValue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 18px 42px -30px rgb(15 23 42 / 0.5)' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 2, 2]} barSize={34}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        </motion.div>
    )
}

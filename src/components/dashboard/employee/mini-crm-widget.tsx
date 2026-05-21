'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const mockLeads = [
    { id: 1, name: 'Alice Estate', status: 'New', value: '$12k' },
    { id: 2, name: 'Green Corp', status: 'Contacted', value: '$45k' },
    { id: 3, name: 'Urban Living', status: 'Negotiation', value: '$28k' },
    { id: 4, name: 'Sky High Ltd', status: 'New', value: '$85k' },
]

export function MiniCRMWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.08, ease: 'easeOut' }}
        >
        <Card className="premium-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Leads</CardTitle>
                    <CardDescription>Recent assignments</CardDescription>
                </div>
                <Link href="/dashboard/crm">
                    <Button variant="outline" size="sm">View All</Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {mockLeads.map((lead) => (
                        <div key={lead.id} className="interactive-lift flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 p-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-950">{lead.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[10px] h-4 px-1">{lead.status}</Badge>
                                    <span className="text-[10px] text-slate-500 font-mono">{lead.value}</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        </motion.div>
    )
}

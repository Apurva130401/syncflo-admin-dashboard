'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

const mockLeads = [
    { id: 1, name: 'Alice Estate', status: 'New', value: '$12k' },
    { id: 2, name: 'Green Corp', status: 'Contacted', value: '$45k' },
    { id: 3, name: 'Urban Living', status: 'Negotiation', value: '$28k' },
    { id: 4, name: 'Sky High Ltd', status: 'New', value: '$85k' },
]

export function MiniCRMWidget() {
    return (
        <Card className="h-full shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Leads</CardTitle>
                    <CardDescription>Recent assignments</CardDescription>
                </div>
                <Link href="/dashboard/crm">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">View All</Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockLeads.map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
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
    )
}

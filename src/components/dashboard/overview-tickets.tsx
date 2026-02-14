'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Ticket {
    id: string
    subject: string
    status: string
    priority: string
    user_email: string
    created_at: string
}

export function OverviewTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('/api/admin/support-tickets')
                const data = await response.json()
                if (data.tickets) {
                    const open = data.tickets
                        .filter((t: any) => t.status === 'open')
                        .slice(0, 5)
                    setTickets(open)
                }
            } catch (error) {
                console.error('Error fetching tickets:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [])

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200'
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'low': return 'bg-slate-100 text-slate-700 border-slate-200'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <Card className="h-full shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Support Tickets</CardTitle>
                    <CardDescription>Open inquiries needing attention</CardDescription>
                </div>
                <Link href="/dashboard/support-tickets">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        View All
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-sm text-slate-500 text-center py-4">Loading tickets...</p>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-900">No open tickets</p>
                            <p className="text-xs text-slate-500">Great job keeping up with support!</p>
                        </div>
                    ) : (
                        tickets.map((t) => (
                            <div key={t.id} className="flex items-start justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-colors">
                                <div className="flex items-start gap-3 overflow-hidden">
                                    <div className="bg-blue-50 p-2 rounded-full mt-0.5 shrink-0">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate pr-2">{t.subject}</p>
                                        <p className="text-xs text-slate-500 truncate">{t.user_email}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${getPriorityColor(t.priority)}`}>
                                        {t.priority}
                                    </span>
                                    <Link href={`/dashboard/support-tickets?id=${t.id}`}>
                                        <Button size="sm" variant="ghost" className="h-6 text-xs text-slate-500 hover:text-blue-600 px-2">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

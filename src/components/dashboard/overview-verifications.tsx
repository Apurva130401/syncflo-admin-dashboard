'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Verification {
    id: string
    registered_name: string
    submitted_at: string
    status: string
    profiles: {
        company_name: string
    }
}

export function OverviewVerifications() {
    const [verifications, setVerifications] = useState<Verification[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await fetch('/api/admin/verifications')
                const data = await response.json()
                if (data.verifications) {
                    const pending = data.verifications
                        .filter((v: any) => v.status === 'pending')
                        .slice(0, 5) // Top 5
                    setVerifications(pending)
                }
            } catch (error) {
                console.error('Error fetching pending verifications:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPending()
    }, [])

    return (
        <Card className="h-full shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Pending Verifications</CardTitle>
                    <CardDescription>Businesses awaiting approval</CardDescription>
                </div>
                <Link href="/dashboard/verifications">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        View All
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-sm text-slate-500 text-center py-4">Loading requests...</p>
                    ) : verifications.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-900">All caught up!</p>
                            <p className="text-xs text-slate-500">No pending verification requests.</p>
                        </div>
                    ) : (
                        verifications.map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{v.registered_name}</p>
                                        <p className="text-xs text-slate-500">{v.profiles?.company_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 mb-1">{format(new Date(v.submitted_at), 'MMM dd')}</p>
                                    <Link href={`/dashboard/verifications?id=${v.id}`}>
                                        <Button size="sm" variant="outline" className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                                            Review
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

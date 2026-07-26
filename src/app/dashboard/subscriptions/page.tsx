'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Search, RefreshCw, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Subscription {
    id: string
    user_id: string
    current_plan?: string
    subscription_status: string
    subscription_start_date?: string
    subscription_end_date?: string
    billing_cycle?: string
    created_at: string
    updated_at: string
    profiles?: {
        id: string
        email: string
        first_name?: string
        last_name?: string
    }
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchSubscriptions = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/subscriptions')
            const result = await response.json()

            if (!response.ok) {
                console.error('Error fetching subscriptions:', result.error)
                return
            }

            setSubscriptions(result.subscriptions || [])
        } catch (error) {
            console.error('Exception during fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200'
            case 'trial':
                return 'bg-sky-100 text-sky-800 border-sky-200'
            case 'inactive':
            case 'cancelled':
                return 'bg-rose-100 text-rose-800 border-rose-200'
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-200'
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const getUserName = (subscription: Subscription) => {
        const profile = subscription.profiles
        if (profile?.first_name || profile?.last_name) {
            const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
            if (name) return name
        }
        if (profile?.email && !profile.email.startsWith('User #')) {
            return profile.email.split('@')[0]
        }
        if (profile?.email) {
            return profile.email
        }
        return `User #${subscription.user_id ? subscription.user_id.slice(0, 8) : 'N/A'}`
    }

    const getUserEmail = (subscription: Subscription) => {
        return subscription.profiles?.email || 'N/A'
    }

    const filteredSubscriptions = subscriptions.filter((subscription) => {
        const userName = getUserName(subscription).toLowerCase()
        const userEmail = getUserEmail(subscription).toLowerCase()
        const plan = (subscription.current_plan || '').toLowerCase()
        const status = (subscription.subscription_status || '').toLowerCase()
        const search = searchTerm.toLowerCase()

        return userName.includes(search) ||
            userEmail.includes(search) ||
            plan.includes(search) ||
            status.includes(search)
    })

    const formatDateSafe = (dateStr?: string) => {
        if (!dateStr) return 'N/A'
        try {
            return format(new Date(dateStr), 'MMM dd, yyyy')
        } catch (e) {
            return dateStr
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                        <CreditCard className="h-7 w-7 text-slate-950" />
                        Subscription Tracker
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Monitor all user subscriptions, trials, and active plans synced from Supabase</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSubscriptions}
                    disabled={loading}
                    className="gap-2 text-slate-700 font-semibold border-slate-300"
                >
                    <RefreshCw className={`h-4 w-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
                    Sync Subscriptions
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">All Subscriptions ({filteredSubscriptions.length})</CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                View and manage user subscription details and plan statuses
                            </CardDescription>
                        </div>
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                placeholder="Search by user, email, plan, or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 text-xs h-9 bg-white border-slate-200"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table className="text-xs">
                        <TableHeader className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                            <TableRow>
                                <TableHead className="py-3">User</TableHead>
                                <TableHead className="py-3">Plan</TableHead>
                                <TableHead className="py-3">Status</TableHead>
                                <TableHead className="py-3">Billing Cycle</TableHead>
                                <TableHead className="py-3">Start Date</TableHead>
                                <TableHead className="py-3">End Date</TableHead>
                                <TableHead className="py-3">Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                                        <RefreshCw className="h-6 w-6 mx-auto animate-spin text-emerald-600 mb-2" />
                                        Loading user subscriptions from database...
                                    </TableCell>
                                </TableRow>
                            ) : filteredSubscriptions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                                        No subscription records match your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubscriptions.map((subscription) => (
                                    <TableRow key={subscription.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="py-3.5">
                                            <div>
                                                <div className="font-bold text-slate-900">{getUserName(subscription)}</div>
                                                <div className="text-slate-500 text-[11px]">
                                                    {getUserEmail(subscription)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3.5 font-bold text-slate-800">
                                            {subscription.current_plan || 'Free Trial'}
                                        </TableCell>
                                        <TableCell className="py-3.5">
                                            <Badge
                                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border ${getStatusColor(subscription.subscription_status)}`}
                                            >
                                                {subscription.subscription_status || 'trial'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3.5 capitalize font-medium text-slate-700">
                                            {subscription.billing_cycle || 'N/A'}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-slate-600">
                                            {formatDateSafe(subscription.subscription_start_date)}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-slate-600">
                                            {formatDateSafe(subscription.subscription_end_date)}
                                        </TableCell>
                                        <TableCell className="py-3.5 text-slate-500">
                                            {formatDateSafe(subscription.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

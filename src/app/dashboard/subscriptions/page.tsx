'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Search } from 'lucide-react'

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

    useEffect(() => {
        const fetchSubscriptions = async () => {
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

        fetchSubscriptions()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'default'
            case 'inactive':
            case 'cancelled':
                return 'destructive'
            case 'pending':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    const getUserName = (subscription: Subscription) => {
        const profile = subscription.profiles
        if (profile?.first_name || profile?.last_name) {
            return `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        }
        return profile?.email || 'Unknown User'
    }

    const filteredSubscriptions = subscriptions.filter((subscription) => {
        const userName = getUserName(subscription).toLowerCase()
        const userEmail = subscription.profiles?.email?.toLowerCase() || ''
        const plan = subscription.current_plan?.toLowerCase() || ''
        const status = subscription.subscription_status?.toLowerCase() || ''
        const search = searchTerm.toLowerCase()

        return userName.includes(search) ||
            userEmail.includes(search) ||
            plan.includes(search) ||
            status.includes(search)
    })

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading subscriptions...</div>
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                    Subscription Tracker
                </h1>
                <p className="text-slate-600 mt-2 text-lg">Monitor all user subscriptions and their status</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Subscriptions ({filteredSubscriptions.length})</CardTitle>
                    <CardDescription>
                        View and manage user subscription details
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by user, email, plan, or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Billing Cycle</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubscriptions.map((subscription) => (
                                <TableRow key={subscription.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{getUserName(subscription)}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {subscription.profiles?.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{subscription.current_plan || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={getStatusColor(subscription.subscription_status)}
                                            className={subscription.subscription_status?.toLowerCase() === 'inactive' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                                        >
                                            {subscription.subscription_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{subscription.billing_cycle || 'N/A'}</TableCell>
                                    <TableCell>
                                        {subscription.subscription_start_date
                                            ? format(new Date(subscription.subscription_start_date), 'MMM dd, yyyy')
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {subscription.subscription_end_date
                                            ? format(new Date(subscription.subscription_end_date), 'MMM dd, yyyy')
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(subscription.created_at), 'MMM dd, yyyy')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
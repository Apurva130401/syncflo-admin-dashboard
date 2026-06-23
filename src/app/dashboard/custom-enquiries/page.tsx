'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays, ExternalLink, Inbox, Loader2, Mail, Save, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

type InquiryStatus = 'New' | 'In Progress' | 'Contacted' | 'Closed'

interface EnterpriseInquiry {
    id: string
    name?: string
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    companyName?: string
    website?: string
    planCategory?: string
    expectedVolume?: string
    agentSlots?: string
    workflowAutomations?: string
    capabilities?: string
    crmSystem?: string
    useCase?: string
    status?: string
    internalNotes?: string
    createdAt?: string
}

const statusOptions: InquiryStatus[] = ['New', 'In Progress', 'Contacted', 'Closed']

const statusStyles: Record<InquiryStatus, string> = {
    New: 'border-amber-200 bg-amber-50 text-amber-800',
    'In Progress': 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Contacted: 'border-purple-200 bg-purple-50 text-purple-800',
    Closed: 'border-slate-200 bg-slate-100 text-slate-700',
}

function getDisplayStatus(status?: string): InquiryStatus {
    if (status && statusOptions.includes(status as InquiryStatus)) {
        return status as InquiryStatus
    }

    return 'New'
}

function formatDate(value?: string) {
    if (!value) return 'Unknown'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown'

    return format(date, 'MMM d, yyyy')
}

function formatTimestamp(value?: string) {
    if (!value) return 'Unknown submission time'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown submission time'

    return format(date, 'MMM d, yyyy, h:mm a')
}

function ensureWebsiteUrl(value?: string) {
    if (!value) return ''
    return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function DetailItem({ label, value, href }: { label: string; value?: string; href?: string }) {
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
            {href && value ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex min-w-0 items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                    <span className="truncate">{value}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
            ) : (
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value || 'Not provided'}</p>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status?: string }) {
    const normalized = getDisplayStatus(status)

    return (
        <Badge variant="outline" className={cn('font-semibold', statusStyles[normalized])}>
            {normalized}
        </Badge>
    )
}

export default function CustomEnquiriesPage() {
    const [inquiries, setInquiries] = useState<EnterpriseInquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'All' | InquiryStatus>('All')
    const [selectedInquiry, setSelectedInquiry] = useState<EnterpriseInquiry | null>(null)
    const [draftStatus, setDraftStatus] = useState<InquiryStatus>('New')
    const [draftNotes, setDraftNotes] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        async function fetchInquiries() {
            try {
                const response = await fetch('/api/admin/custom-enquiries')
                const result = await response.json()

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch custom enquiries')
                }

                setInquiries(result.inquiries || [])
            } catch (error) {
                console.error('Error fetching custom enquiries:', error)
                setLoadError(error instanceof Error ? error.message : 'Failed to fetch custom enquiries')
                toast({
                    title: 'Unable to load enquiries',
                    description: error instanceof Error ? error.message : 'Please check the CRM connection and try again.',
                    variant: 'destructive',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchInquiries()
    }, [toast])

    const filteredInquiries = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        return inquiries.filter((inquiry) => {
            const status = getDisplayStatus(inquiry.status)
            const matchesStatus = statusFilter === 'All' || status === statusFilter
            const searchableText = [
                inquiry.name,
                inquiry.contactName,
                inquiry.companyName,
                inquiry.contactEmail,
            ].join(' ').toLowerCase()

            return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch))
        })
    }, [inquiries, searchTerm, statusFilter])

    const openInquiry = (inquiry: EnterpriseInquiry) => {
        setSelectedInquiry(inquiry)
        setDraftStatus(getDisplayStatus(inquiry.status))
        setDraftNotes(inquiry.internalNotes || '')
    }

    const closeInquiry = (open: boolean) => {
        if (open) return
        setSelectedInquiry(null)
        setDraftNotes('')
        setDraftStatus('New')
    }

    const saveProgress = async () => {
        if (!selectedInquiry) return

        setSaving(true)
        try {
            const response = await fetch(`/api/admin/custom-enquiries/${selectedInquiry.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: draftStatus,
                    internalNotes: draftNotes,
                }),
            })
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save progress')
            }

            const updatedInquiry = {
                ...selectedInquiry,
                ...(result.inquiry || {}),
                status: draftStatus,
                internalNotes: draftNotes,
            }

            setSelectedInquiry(updatedInquiry)
            setInquiries((current) => current.map((inquiry) => (
                inquiry.id === selectedInquiry.id ? updatedInquiry : inquiry
            )))
            toast({
                title: 'Progress saved',
                description: 'The custom enquiry status and notes were updated.',
            })
        } catch (error) {
            console.error('Error saving custom enquiry:', error)
            toast({
                title: 'Unable to save progress',
                description: 'Please try again in a moment.',
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    const mailtoHref = selectedInquiry?.contactEmail
        ? `mailto:${selectedInquiry.contactEmail}?subject=${encodeURIComponent('Regarding your Custom Plan Scoping Inquiry')}`
        : '#'
    const websiteUrl = ensureWebsiteUrl(selectedInquiry?.website)

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Inbox className="h-5 w-5 text-emerald-700" />
                            <h1 className="text-2xl font-bold text-slate-950">Custom Enquiries</h1>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Track custom plan submissions, sales handoffs, and internal follow-up notes.
                        </p>
                    </div>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                        {filteredInquiries.length} visible
                    </Badge>
                </div>
            </div>

            <Card className="premium-card overflow-hidden">
                <CardHeader className="border-b border-slate-100">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <CardTitle className="text-lg text-slate-950">Enterprise Plan Submissions</CardTitle>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative w-full sm:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search name, company, or email"
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'All' | InquiryStatus)}>
                                <SelectTrigger className="w-full sm:w-44">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loadError && (
                        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm font-medium text-amber-900">
                            {loadError}
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80">
                                    <TableHead className="min-w-64">Submitter</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Expected Volume</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInquiries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-sm text-slate-500">
                                            No custom enquiries match your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInquiries.map((inquiry) => (
                                        <TableRow
                                            key={inquiry.id}
                                            className="cursor-pointer transition-colors hover:bg-emerald-50/40"
                                            onClick={() => openInquiry(inquiry)}
                                        >
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-slate-950">
                                                        {inquiry.contactName || inquiry.name || 'Unnamed contact'}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {inquiry.companyName || inquiry.contactEmail || 'No company provided'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700">
                                                {inquiry.planCategory || 'Not specified'}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {inquiry.expectedVolume || 'Not provided'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={inquiry.status} />
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                                    {formatDate(inquiry.createdAt)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedInquiry} onOpenChange={closeInquiry}>
                <DialogContent className="max-h-[92vh] overflow-y-auto border-slate-200 bg-slate-50 p-0 shadow-2xl sm:max-w-5xl">
                    <DialogHeader className="border-b border-slate-200 bg-white p-6 pr-12">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <DialogTitle className="text-2xl text-slate-950">
                                    {selectedInquiry?.contactName || selectedInquiry?.name || 'Custom enquiry'}
                                </DialogTitle>
                                <DialogDescription className="mt-2">
                                    {selectedInquiry?.companyName || 'No company provided'} · {formatTimestamp(selectedInquiry?.createdAt)}
                                </DialogDescription>
                            </div>
                            <StatusBadge status={draftStatus} />
                        </div>
                    </DialogHeader>

                    {selectedInquiry && (
                        <div className="space-y-5 p-6">
                            <div className="grid gap-3 md:grid-cols-2">
                                <DetailItem label="Email" value={selectedInquiry.contactEmail} />
                                <DetailItem label="Phone" value={selectedInquiry.contactPhone} />
                                <DetailItem label="Website" value={selectedInquiry.website} href={websiteUrl} />
                                <DetailItem label="Plan Category" value={selectedInquiry.planCategory} />
                                <DetailItem label="Expected Volume" value={selectedInquiry.expectedVolume} />
                                <DetailItem label="AI Agent Slots" value={selectedInquiry.agentSlots} />
                                <DetailItem label="Workflow Automations" value={selectedInquiry.workflowAutomations} />
                                <DetailItem label="CRM System" value={selectedInquiry.crmSystem} />
                                <DetailItem label="Requested Capabilities" value={selectedInquiry.capabilities} />
                            </div>

                            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                                    Use Case Details
                                </p>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {selectedInquiry.useCase || 'No use case details were provided.'}
                                </p>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                    <div className="space-y-2 lg:w-64">
                                        <Label htmlFor="custom-enquiry-status">Status</Label>
                                        <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as InquiryStatus)}>
                                            <SelectTrigger id="custom-enquiry-status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Label htmlFor="custom-enquiry-notes">Internal Notes</Label>
                                        <Textarea
                                            id="custom-enquiry-notes"
                                            value={draftNotes}
                                            onChange={(event) => setDraftNotes(event.target.value)}
                                            placeholder="Add sales context, next steps, objection notes, or owner handoff details..."
                                            className="min-h-36 resize-y"
                                        />
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                    <Button variant="outline" asChild disabled={!selectedInquiry.contactEmail}>
                                        <a href={mailtoHref}>
                                            <Mail className="h-4 w-4" />
                                            Email Client
                                        </a>
                                    </Button>
                                    <Button onClick={saveProgress} disabled={saving}>
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Save Progress
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

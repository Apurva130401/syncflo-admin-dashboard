'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import {
    CheckCircle,
    XCircle,
    FileText,
    ExternalLink,
    Search,
    ShieldCheck
} from 'lucide-react'

interface Document {
    url: string
    type: string
    name: string
}

interface UserProfile {
    first_name: string
    last_name: string
    company_name: string
    email: string
}

interface Verification {
    id: string
    user_id: string
    status: 'pending' | 'verified' | 'rejected' | 'not_started'
    submitted_at: string
    verified_at?: string
    rejection_reason?: string
    admin_notes?: string
    business_type: string
    registered_name: string
    gst_number: string
    pan_number: string
    business_registration_no: string
    business_address: string
    documents: Document[]
    profiles: UserProfile
    created_at: string
    updated_at: string
}

export default function VerificationsPage() {
    const [verifications, setVerifications] = useState<Verification[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Action states
    const [actionLoading, setActionLoading] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [adminNotes, setAdminNotes] = useState('')
    const [showRejectInput, setShowRejectInput] = useState(false)

    useEffect(() => {
        fetchVerifications()
    }, [])

    const fetchVerifications = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/verifications')
            const data = await response.json()
            if (data.verifications) {
                setVerifications(data.verifications)
            }
        } catch (error) {
            console.error('Error fetching verifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (verification: Verification) => {
        setSelectedVerification(verification)
        setAdminNotes(verification.admin_notes || '')
        setRejectionReason('')
        setShowRejectInput(false)
        setIsDialogOpen(true)
    }

    const handleVerify = async () => {
        if (!selectedVerification) return

        try {
            setActionLoading(true)
            const response = await fetch('/api/admin/verifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedVerification.id,
                    action: 'approve',
                    admin_notes: adminNotes
                })
            })

            if (response.ok) {
                setIsDialogOpen(false)
                fetchVerifications()
            }
        } catch (error) {
            console.error('Error approving verification:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedVerification) return
        if (!showRejectInput) {
            setShowRejectInput(true)
            return
        }
        if (!rejectionReason.trim()) return

        try {
            setActionLoading(true)
            const response = await fetch('/api/admin/verifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedVerification.id,
                    action: 'reject',
                    rejection_reason: rejectionReason,
                    admin_notes: adminNotes
                })
            })

            if (response.ok) {
                setIsDialogOpen(false)
                fetchVerifications()
            }
        } catch (error) {
            console.error('Error rejecting verification:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20">Verified</Badge>
            case 'pending':
                return <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20">Pending Review</Badge>
            case 'rejected':
                return <Badge className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-red-500/20">Rejected</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const filteredVerifications = verifications.filter(v =>
        v.registered_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.profiles?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const pendingCount = verifications.filter(v => v.status === 'pending').length
    const verifiedCount = verifications.filter(v => v.status === 'verified').length
    const rejectedCount = verifications.filter(v => v.status === 'rejected').length

    return (
        <div className="space-y-6">
            <div className="mb-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Business Verification
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Review and approve business verification requests</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search business..."
                        className="pl-8 bg-slate-50 border-slate-200 focus:border-emerald-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">All ({verifications.length})</TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Pending ({pendingCount})</TabsTrigger>
                    <TabsTrigger value="verified" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Verified ({verifiedCount})</TabsTrigger>
                    <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Rejected ({rejectedCount})</TabsTrigger>
                </TabsList>

                {['all', 'pending', 'verified', 'rejected'].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        <Card className="border shadow-sm">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            <TableHead>Company Name</TableHead>
                                            <TableHead>Registered Name</TableHead>
                                            <TableHead>Business Type</TableHead>
                                            <TableHead>Submitted Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredVerifications
                                            .filter(v => tab === 'all' || v.status === tab)
                                            .map((verification) => (
                                                <TableRow key={verification.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleOpenDialog(verification)}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-800">{verification.profiles?.company_name || 'N/A'}</span>
                                                            <span className="text-xs text-muted-foreground">{verification.profiles?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{verification.registered_name}</TableCell>
                                                    <TableCell className="capitalize">{verification.business_type.replace(/_/g, ' ')}</TableCell>
                                                    <TableCell>{format(new Date(verification.submitted_at), 'MMM dd, yyyy')}</TableCell>
                                                    <TableCell>{getStatusBadge(verification.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleOpenDialog(verification)
                                                        }}>
                                                            Review
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        {filteredVerifications.filter(v => tab === 'all' || v.status === tab).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    No verification requests found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-full sm:max-w-[95vw] lg:max-w-5xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-white text-slate-900 border-slate-200 shadow-2xl flex flex-col sm:rounded-2xl">
                    <DialogHeader className="p-4 sm:p-6 border-b bg-slate-50/50 sticky top-0 z-10 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-3 text-slate-900 font-bold">
                                Review Verification
                                {selectedVerification && getStatusBadge(selectedVerification.status)}
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-slate-500 text-xs">
                                Submitted on {selectedVerification && format(new Date(selectedVerification.submitted_at), 'PPP')}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {selectedVerification && (
                        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Business & Documents (2/3 width) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Business Details */}
                                <section>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="h-4 w-1 bg-emerald-500 rounded-full"></div>
                                        Business Details
                                    </h3>
                                    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden rounded-xl">
                                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Name</span>
                                                <p className="text-sm font-semibold text-slate-900">{selectedVerification.registered_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Type</span>
                                                <div className="w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                    {selectedVerification.business_type.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GST Number</span>
                                                <p className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded w-fit border border-slate-100">{selectedVerification.gst_number || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PAN Number</span>
                                                <p className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded w-fit border border-slate-100">{selectedVerification.pan_number || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2 space-y-1 pt-3 border-t border-slate-100">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registration Number</span>
                                                <p className="text-sm font-mono text-slate-700">{selectedVerification.business_registration_no || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2 space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Address</span>
                                                <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    {selectedVerification.business_address || 'No address provided'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>

                                {/* Documents */}
                                <section>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="h-4 w-1 bg-amber-500 rounded-full"></div>
                                        Documents
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedVerification.documents && selectedVerification.documents.length > 0 ? (
                                            selectedVerification.documents.map((doc, index) => (
                                                <a
                                                    key={index}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
                                                >
                                                    <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 mr-3">
                                                        <FileText className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-700 truncate">{doc.type.replace(/_/g, ' ').toUpperCase()}</p>
                                                        <p className="text-[10px] text-slate-400 truncate">{doc.name}</p>
                                                    </div>
                                                    <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 ml-2" />
                                                </a>
                                            ))
                                        ) : (
                                            <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                                <FileText className="h-6 w-6 text-slate-300 mb-2" />
                                                <p className="text-xs text-slate-400 font-medium">No documents uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: User & Actions (1/3 width) */}
                            <div className="space-y-6">
                                {/* User Profile */}
                                <section>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="h-4 w-1 bg-emerald-500 rounded-full"></div>
                                        User Profile
                                    </h3>
                                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm border border-emerald-100">
                                                    {selectedVerification.profiles?.first_name?.[0]}{selectedVerification.profiles?.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">
                                                        {selectedVerification.profiles?.first_name} {selectedVerification.profiles?.last_name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Applicant</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Company</span>
                                                    <p className="text-xs text-slate-700 font-medium">{selectedVerification.profiles?.company_name}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Email Contact</span>
                                                    <div className="text-[10px] text-slate-600 font-medium break-all bg-slate-50 p-2 rounded border border-slate-100">
                                                        {selectedVerification.profiles?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>

                                {/* Admin Actions */}
                                <section>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="h-4 w-1 bg-emerald-500 rounded-full"></div>
                                        Actions
                                    </h3>
                                    <Card className={selectedVerification.status === 'pending' ? 'border-amber-200 bg-amber-50 shadow-sm rounded-xl' : 'bg-white border-slate-200 shadow-sm rounded-xl'}>
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">Internal Notes</label>
                                                <Textarea
                                                    placeholder="Add private notes..."
                                                    value={adminNotes}
                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                    className="min-h-[60px] text-xs bg-white border-slate-200 focus:border-emerald-500 resize-none rounded-lg"
                                                />
                                            </div>

                                            {selectedVerification.rejection_reason && (
                                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                                                    <span className="font-bold block mb-1 text-red-800 uppercase text-[9px] tracking-wider">Rejection Reason</span>
                                                    {selectedVerification.rejection_reason}
                                                </div>
                                            )}

                                            {showRejectInput && (
                                                <div className="space-y-2 pt-3 border-t border-slate-200 animate-in slide-in-from-top-2 fade-in duration-200">
                                                    <label className="text-[10px] font-bold uppercase text-red-600">Reason for Rejection *</label>
                                                    <Textarea
                                                        placeholder="Please provide a reason..."
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        className="min-h-[80px] text-xs bg-red-50 border-red-100 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-100 rounded-lg"
                                                        autoFocus
                                                    />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                {showRejectInput ? (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowRejectInput(false)}
                                                            disabled={actionLoading}
                                                            className="border-slate-200 text-slate-500 hover:bg-slate-50 text-xs h-9"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={handleReject}
                                                            disabled={actionLoading || !rejectionReason.trim()}
                                                            className="bg-red-600 hover:bg-red-700 shadow-sm text-xs h-9"
                                                        >
                                                            {actionLoading ? '...' : 'Reject'}
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs h-9 font-semibold"
                                                            onClick={() => setShowRejectInput(true)}
                                                            disabled={actionLoading || selectedVerification.status === 'rejected'}
                                                        >
                                                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all text-xs h-9 font-semibold"
                                                            onClick={handleVerify}
                                                            disabled={actionLoading || selectedVerification.status === 'verified'}
                                                        >
                                                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                                            Approve
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface ContactSubmission {
    id: string
    created_at: string
    first_name: string
    last_name: string
    email: string
    business_name: string
    industry: string
    whatsapp: string
    query_count: string
    message: string
    status: 'new' | 'contacted' | 'closed'
}

export default function InquiriesPage() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [showReplyInput, setShowReplyInput] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchSubmissions()
    }, [])

    const fetchSubmissions = async () => {
        try {
            const { data, error } = await supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            setSubmissions(data || [])
        } catch (error) {
            console.error('Error fetching submissions:', error)
            toast({
                title: "Error",
                description: "Failed to fetch inquiries. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('contact_submissions')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            setSubmissions(submissions.map(sub =>
                sub.id === id ? { ...sub, status: newStatus as any } : sub
            ))

            toast({
                title: "Status Updated",
                description: "The inquiry status has been updated successfully.",
            })
        } catch (error) {
            console.error('Error updating status:', error)
            toast({
                title: "Error",
                description: "Failed to update status. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleSendReply = async () => {
        if (!selectedSubmission || !replyMessage.trim()) return

        setSending(true)
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: selectedSubmission.email,
                    subject: `Re: Inquiry from ${selectedSubmission.business_name}`,
                    message: replyMessage,
                }),
            })

            if (!response.ok) throw new Error('Failed to send email')

            toast({
                title: "Reply Sent",
                description: "Your reply has been sent successfully.",
            })

            // Update status to 'contacted' if it's currently 'new'
            if (selectedSubmission.status === 'new') {
                await updateStatus(selectedSubmission.id, 'contacted')
            }

            setReplyMessage('')
            setShowReplyInput(false)
            setSelectedSubmission(null)
        } catch (error) {
            console.error('Error sending reply:', error)
            toast({
                title: "Error",
                description: "Failed to send reply. Please try again.",
                variant: "destructive",
            })
        } finally {
            setSending(false)
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'new': return 'default'
            case 'contacted': return 'secondary'
            case 'closed': return 'outline'
            default: return 'default'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inquiries</h1>
            </div>

            <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Contact Submissions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>WhatsApp</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No inquiries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map((submission) => (
                                        <TableRow key={submission.id} className="hover:bg-transparent">
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(submission.created_at), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {submission.first_name} {submission.last_name}
                                            </TableCell>
                                            <TableCell>{submission.email}</TableCell>
                                            <TableCell>{submission.business_name}</TableCell>
                                            <TableCell>{submission.industry}</TableCell>
                                            <TableCell>{submission.whatsapp}</TableCell>
                                            <TableCell
                                                className="max-w-xs truncate cursor-pointer hover:text-primary hover:underline"
                                                title="Click to view full message"
                                                onClick={() => setSelectedSubmission(submission)}
                                            >
                                                {submission.message}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    defaultValue={submission.status}
                                                    onValueChange={(value) => updateStatus(submission.id, value)}
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue>
                                                            <Badge variant={getStatusBadgeVariant(submission.status)}>
                                                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                                            </Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">New</SelectItem>
                                                        <SelectItem value="contacted">Contacted</SelectItem>
                                                        <SelectItem value="closed">Closed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSubmission} onOpenChange={(open) => {
                if (!open) {
                    setSelectedSubmission(null)
                    setShowReplyInput(false)
                    setReplyMessage('')
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Inquiry Details</DialogTitle>
                        <DialogDescription>
                            Message from {selectedSubmission?.first_name} {selectedSubmission?.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Message</h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedSubmission?.message}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Email:</span> {selectedSubmission?.email}
                            </div>
                            <div>
                                <span className="font-semibold">WhatsApp:</span> {selectedSubmission?.whatsapp}
                            </div>
                            <div>
                                <span className="font-semibold">Business:</span> {selectedSubmission?.business_name}
                            </div>
                            <div>
                                <span className="font-semibold">Industry:</span> {selectedSubmission?.industry}
                            </div>
                        </div>
                    </div>

                    {showReplyInput ? (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Your Reply</h4>
                                <Textarea
                                    placeholder="Type your reply here..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowReplyInput(false)} disabled={sending}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSendReply} disabled={sending || !replyMessage.trim()}>
                                    {sending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Reply
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-end pt-4 border-t">
                            <Button onClick={() => setShowReplyInput(true)}>
                                Reply via Email
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

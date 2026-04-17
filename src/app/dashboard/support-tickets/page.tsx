'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import TicketChat from '@/components/dashboard/ticket-chat'

interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  user_email?: string
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/admin/support-tickets')
        const result = await response.json()

        if (!response.ok) {
          console.error('Error fetching tickets:', result.error)
          return
        }

        setTickets(result.tickets || [])
      } catch (error) {
        console.error('Exception during fetch:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()

    const supabase = createClient()
    const channel = supabase
      .channel('admin_support_tickets_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets'
      }, (payload) => {
        console.log('Ticket list change received:', payload)
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new as SupportTicket, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as SupportTicket
          setTickets(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id === payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/support-tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId, status: newStatus }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error updating ticket status:', result.error)
        return
      }

      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const openTicketDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in_progress': return 'default'
      case 'resolved': return 'secondary'
      case 'closed': return 'outline'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Support Tickets
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage customer support requests and track resolutions</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
             {tickets.length} Total Tickets
           </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({tickets.length})</CardTitle>
          <CardDescription>
            View and manage support tickets from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.user_email}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => handleStatusChange(ticket.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openTicketDialog(ticket)}>
                      View Chat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full sm:max-w-[95vw] lg:max-w-5xl h-[100dvh] sm:h-[90vh] overflow-hidden p-0 sm:p-4 gap-0 bg-white text-slate-900 border-slate-200 shadow-2xl flex flex-col sm:rounded-2xl">
          <DialogHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-lg font-bold text-slate-900">
              Ticket Details - <span className="text-emerald-600">{selectedTicket?.subject}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-8 overflow-hidden">
            {/* Ticket Information - Collapsible or scrollable sidebar */}
            <div className="w-full lg:w-80 space-y-4 overflow-y-auto p-4 sm:p-0 bg-slate-50/30 lg:bg-transparent border-b lg:border-none border-slate-100">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-semibold text-emerald-600 text-sm uppercase tracking-wider">Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 text-xs">User</span>
                    <span className="font-medium text-slate-900 truncate">{selectedTicket?.user_email}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 text-xs">Status</span>
                    <div className="flex items-center gap-2">
                       <Badge variant={getStatusColor(selectedTicket?.status || '')} className="capitalize py-0 h-5">
                        {(selectedTicket?.status || '').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 text-xs">Priority</span>
                    <Badge variant={getPriorityColor(selectedTicket?.priority || '')} className="w-fit capitalize py-0 h-5">
                      {selectedTicket?.priority}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 text-xs">Created</span>
                    <p className="text-slate-600">
                      {selectedTicket ? format(new Date(selectedTicket.created_at), 'MMM dd, h:mm a') : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2 hidden lg:block">
                <h3 className="font-semibold text-emerald-600 text-sm uppercase tracking-wider">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto pr-2">
                  {selectedTicket?.description}
                </p>
              </div>
            </div>

            {/* Chat Section - Flexible height */}
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50 lg:rounded-xl overflow-hidden border border-slate-100 mt-4 lg:mt-0">
              {selectedTicket && <TicketChat ticketId={selectedTicket.id} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
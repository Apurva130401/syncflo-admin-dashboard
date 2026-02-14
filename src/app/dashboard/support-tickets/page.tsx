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
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
          Support Tickets
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Manage customer support requests and track resolutions</p>
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
        <DialogContent className="w-full sm:max-w-[90vw] lg:max-w-7xl max-h-[90vh] overflow-hidden p-6 gap-6 bg-white text-slate-900 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Ticket Details - {selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">
            <div className="space-y-6 overflow-y-auto pr-2">
              <div>
                <h3 className="font-semibold">Ticket Information</h3>
                <p><strong>User:</strong> {selectedTicket?.user_email}</p>
                <p><strong>Subject:</strong> {selectedTicket?.subject}</p>
                <p><strong>Description:</strong> {selectedTicket?.description}</p>
                <p><strong>Status:</strong> {selectedTicket?.status}</p>
                <p><strong>Priority:</strong> {selectedTicket?.priority}</p>
                <p><strong>Created:</strong> {selectedTicket ? format(new Date(selectedTicket.created_at), 'PPP p') : ''}</p>
              </div>
            </div>
            <div className="lg:col-span-2">
              {selectedTicket && <TicketChat ticketId={selectedTicket.id} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
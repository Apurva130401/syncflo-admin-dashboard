'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InvoiceTemplate } from '@/components/invoice-template'
import {
  FileText,
  PlusCircle,
  Search,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  DollarSign,
  Send,
  Building,
  RefreshCw,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface InvoiceItem {
  id: string
  customer_name: string
  customer_email: string
  company_name?: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  created_at: string
  plan_name: string
  items?: { description: string; quantity: number; unit_price: number }[]
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [metrics, setMetrics] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Selected Invoice for Viewing/Printing
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Create Invoice Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newPlanName, setNewPlanName] = useState('Pro Tier Subscription')
  const [newAmount, setNewAmount] = useState('299')
  const [newStatus, setNewStatus] = useState<'paid' | 'pending'>('pending')

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
        if (data.metrics) {
          setMetrics(data.metrics)
        }
      }
    } catch (e) {
      console.error('Failed to load invoices:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        searchQuery === '' ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.company_name && inv.company_name.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchQuery, statusFilter])

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomerName || !newCustomerEmail || !newAmount) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: newCustomerName,
          customer_email: newCustomerEmail,
          company_name: newCompanyName,
          plan_name: newPlanName,
          amount: Number(newAmount),
          status: newStatus,
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.invoice) {
          setInvoices([data.invoice, ...invoices])
          // Recalculate metrics
          setMetrics(prev => ({
            ...prev,
            totalInvoiced: prev.totalInvoiced + data.invoice.amount,
            totalPaid: newStatus === 'paid' ? prev.totalPaid + data.invoice.amount : prev.totalPaid,
            totalPending: newStatus === 'pending' ? prev.totalPending + data.invoice.amount : prev.totalPending,
            paidCount: newStatus === 'paid' ? prev.paidCount + 1 : prev.paidCount,
            pendingCount: newStatus === 'pending' ? prev.pendingCount + 1 : prev.pendingCount,
          }))
        }
        setIsCreateOpen(false)
        setNewCustomerName('')
        setNewCustomerEmail('')
        setNewCompanyName('')
        setNewAmount('299')
      }
    } catch (e) {
      console.error('Error creating invoice:', e)
    } finally {
      setIsCreating(false)
    }
  }

  const handleMarkAsPaid = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          return { ...inv, status: 'paid' as const }
        }
        return inv
      })
    )
    alert(`Invoice ${id} marked as Paid successfully!`)
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  const formatCurrency = (amt: number) => {
    return `$${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-white rounded-xl shadow-md">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Invoices Management
              </h1>
              <p className="text-slate-500 mt-0.5 text-sm font-medium">
                Track client billing, generate invoices, send payment requests, and monitor payouts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-slate-950 hover:bg-slate-800 text-white font-bold gap-2 text-xs"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            Create Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoices}
            disabled={isLoading}
            className="gap-2 text-slate-700 font-semibold"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoiced</p>
              <p className="text-2xl font-extrabold text-slate-950 mt-1">{formatCurrency(metrics.totalInvoiced)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{invoices.length} total records</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Total Collected</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(metrics.totalPaid)}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{metrics.paidCount} paid invoices</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Amount</p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">{formatCurrency(metrics.totalPending)}</p>
              <p className="text-xs text-amber-600 mt-0.5">{metrics.pendingCount} awaiting payment</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Overdue Amount</p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{formatCurrency(metrics.totalOverdue)}</p>
              <p className="text-xs text-rose-500 mt-0.5">{metrics.overdueCount} require follow-up</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table & Controls */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Invoices Directory</CardTitle>
              <CardDescription className="text-xs text-slate-500">View, preview, print, and manage customer billing statements</CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search invoice, client, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 w-56 bg-white border-slate-200"
                />
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'paid' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'pending' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('overdue')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'overdue' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overdue
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice ID</th>
                  <th className="px-4 py-3">Client & Company</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 mx-auto animate-spin text-emerald-600 mb-2" />
                      Loading invoices from database...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-30 stroke-[1.5]" />
                      <p className="text-sm font-bold text-slate-800">No invoices match your search</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {inv.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{inv.customer_name}</div>
                        <div className="text-[11px] text-slate-500">{inv.company_name || inv.customer_email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {inv.plan_name}
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-950 font-mono">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        {inv.status === 'paid' && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase text-[10px]">
                            ✓ Paid
                          </Badge>
                        )}
                        {inv.status === 'pending' && (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-bold uppercase text-[10px]">
                            Pending
                          </Badge>
                        )}
                        {inv.status === 'overdue' && (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold uppercase text-[10px]">
                            Overdue
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(inv)
                              setIsPreviewOpen(true)
                            }}
                            className="h-7 text-xs text-slate-700 font-semibold gap-1 hover:bg-slate-100"
                            title="Preview Invoice"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            View
                          </Button>
                          {inv.status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsPaid(inv.id)}
                              className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 font-bold"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-100">
          <DialogHeader className="p-4 bg-slate-950 text-white rounded-t-xl flex flex-row items-center justify-between sticky top-0 z-20">
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                Invoice Preview: {selectedInvoice?.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Official billing statement for {selectedInvoice?.customer_name}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 mr-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintInvoice}
                className="bg-white text-slate-900 text-xs font-bold gap-1"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </Button>
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div className="p-6">
              <InvoiceTemplate
                data={{
                  invoiceNumber: selectedInvoice.id,
                  paymentDate: selectedInvoice.created_at,
                  planName: selectedInvoice.plan_name,
                  amount: selectedInvoice.amount,
                  currency: selectedInvoice.currency,
                  customerName: selectedInvoice.customer_name,
                  customerEmail: selectedInvoice.customer_email,
                  paymentId: `PAY-${selectedInvoice.id.slice(-6)}`,
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Custom Invoice Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-600" />
              Generate Custom Invoice
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create and dispatch an invoice to a customer or enterprise client
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Client Full Name</Label>
              <Input
                placeholder="e.g. John Doe"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="h-9 text-xs mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Client Email</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Company Name</Label>
                <Input
                  placeholder="Acme Corp"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Plan / Service Description</Label>
              <Input
                placeholder="Pro Tier Monthly Subscription"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="h-9 text-xs mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Amount ($ USD)</Label>
                <Input
                  type="number"
                  placeholder="299"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Initial Status</Label>
                <Select value={newStatus} onValueChange={(val) => setNewStatus(val as any)}>
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Payment</SelectItem>
                    <SelectItem value="paid">Mark as Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs"
              >
                {isCreating ? 'Generating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

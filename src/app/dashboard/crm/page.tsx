'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Phone, Mail, MoreHorizontal, DollarSign, Briefcase, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const STAGES = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Closed']

export default function CRMPage() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [open, setOpen] = useState(false)
    const [newLead, setNewLead] = useState({ name: '', company: '', email: '', phone: '', value: 0, status: 'New', source: '', currency: 'USD' })

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/leads')
            if (res.ok) {
                const { leads } = await res.json()
                setLeads(leads || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const handleCreateLead = async () => {
        try {
            const res = await fetch('/api/admin/leads', {
                method: 'POST',
                body: JSON.stringify(newLead),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                setOpen(false)
                setNewLead({ name: '', company: '', email: '', phone: '', value: 0, status: 'New', source: '' })
                fetchLeads()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleUpdateStage = async (id: string, newStatus: string) => {
        // Optimistic update
        setLeads(leads.map((l: any) => l.id === id ? { ...l, status: newStatus } : l))
        await fetch('/api/admin/leads', {
            method: 'PATCH',
            body: JSON.stringify({ id, status: newStatus }),
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this lead?')) return
        await fetch('/api/admin/leads', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        })
        fetchLeads()
    }

    const filteredLeads = leads.filter((l: any) =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getTotalValue = () => leads.reduce((acc, curr: any) => acc + (Number(curr.value) || 0), 0)
    const getCountByStage = (stage: string) => leads.filter((l: any) => l.status === stage).length

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pipeline</h1>
                    <p className="text-slate-500">Manage deals and track progress.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="p-3 flex items-center gap-3 shadow-none border bg-blue-50/50">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Pipeline Value</p>
                            <p className="text-sm font-bold text-slate-900">${getTotalValue().toLocaleString()}</p>
                        </div>
                    </Card>
                    <Card className="p-3 flex items-center gap-3 shadow-none border bg-emerald-50/50">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Active Deals</p>
                            <p className="text-sm font-bold text-slate-900">{leads.length}</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center gap-4 shrink-0">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search leads..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800">
                            <Plus className="mr-2 h-4 w-4" /> Add Deal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Deal</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Contact Name</Label>
                                    <Input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Value</Label>
                                    <div className="flex gap-2">
                                        <Select value={newLead.currency} onValueChange={v => setNewLead({ ...newLead, currency: v })}>
                                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={newLead.value} onChange={e => setNewLead({ ...newLead, value: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Source</Label>
                                    <Input value={newLead.source} onChange={e => setNewLead({ ...newLead, source: e.target.value })} />
                                </div>
                            </div>
                            <Button onClick={handleCreateLead} className="w-full mt-2">Create Deal</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto min-h-0 pb-4">
                <div className="flex gap-4 h-full min-w-[1200px]">
                    {STAGES.map(stage => (
                        <div key={stage} className="flex-1 flex flex-col min-w-[280px] bg-slate-50/50 rounded-xl border border-slate-200/60 p-3">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-700">{stage}</span>
                                    <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 rounded-sm px-1.5 py-0 h-5 text-[10px]">
                                        {getCountByStage(stage)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {filteredLeads.filter((l: any) => l.status === stage).map((lead: any) => (
                                    <Card key={lead.id} className="shadow-sm border-slate-200 hover:shadow-md transition-all cursor-pointer group">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium text-slate-900 line-clamp-1">{lead.company || lead.name}</div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-6 w-6 p-0 -mr-2 opacity-0 group-hover:opacity-100">
                                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-red-600">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 truncate">{lead.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                    <span className="text-[10px] font-bold mr-1">{lead.currency || 'USD'}</span>
                                                    {Number(lead.value).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                                <div className="flex gap-1">
                                                    {lead.email && <Mail className="h-3 w-3 text-slate-400" />}
                                                    {lead.phone && <Phone className="h-3 w-3 text-slate-400" />}
                                                </div>
                                                {stage !== 'Closed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600"
                                                        onClick={() => {
                                                            const nextIdx = STAGES.indexOf(stage) + 1
                                                            if (nextIdx < STAGES.length) handleUpdateStage(lead.id, STAGES[nextIdx])
                                                        }}
                                                    >
                                                        Move <ArrowRight className="ml-1 h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

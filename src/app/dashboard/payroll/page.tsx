'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Download, DollarSign, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

export default function PayrollPage() {
    const [payroll, setPayroll] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState('')
    const [users, setUsers] = useState<any[]>([]) // For selecting employee in form
    const [open, setOpen] = useState(false)

    // New Payroll Entry
    const [newEntry, setNewEntry] = useState({
        user_id: '',
        month: format(new Date(), 'yyyy-MM'),
        base_salary: 0,
        bonuses: 0,
        deductions: 0,
        currency: 'USD',
        status: 'Pending'
    })

    const fetchPayroll = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/payroll')
            if (res.ok) {
                const { payroll } = await res.json()
                setPayroll(payroll || [])
            }
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                setRole(profile?.role || 'user')

                // If admin, fetch users for dropdown
                if (['admin', 'accountant'].includes(profile?.role)) {
                    // This assumes we have an API or just query profiles?
                    // Let's use the /api/admin/users if it existed, or just query profiles here for simplicity
                    const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email')
                    setUsers(profiles || [])
                }
            }
            fetchPayroll()
        }
        init()
    }, [])

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/admin/payroll', {
                method: 'POST',
                body: JSON.stringify(newEntry),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                setOpen(false)
                fetchPayroll()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const isAdmin = ['admin', 'accountant'].includes(role)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payroll</h1>
                    <p className="text-slate-500">{isAdmin ? 'Manage employee salaries and payments.' : 'View your salary history.'}</p>
                </div>
                {isAdmin && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="mr-2 h-4 w-4" /> Process Payroll
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Process New Payment</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Employee</Label>
                                    <Select onValueChange={v => setNewEntry({ ...newEntry, user_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                                        <SelectContent>
                                            {users.map((u: any) => (
                                                <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Month</Label>
                                        <Input type="month" value={newEntry.month} onChange={e => setNewEntry({ ...newEntry, month: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Base Salary</Label>
                                        <Input type="number" value={newEntry.base_salary} onChange={e => setNewEntry({ ...newEntry, base_salary: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bonuses</Label>
                                        <Input type="number" value={newEntry.bonuses} onChange={e => setNewEntry({ ...newEntry, bonuses: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deductions</Label>
                                        <Input type="number" value={newEntry.deductions} onChange={e => setNewEntry({ ...newEntry, deductions: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select value={newEntry.currency} onValueChange={v => setNewEntry({ ...newEntry, currency: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={newEntry.status} onValueChange={v => setNewEntry({ ...newEntry, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Processing">Processing</SelectItem>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCreate} className="w-full mt-2">Create Record</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                {isAdmin && <TableHead>Employee</TableHead>}
                                <TableHead>Base Salary</TableHead>
                                <TableHead>Bonuses</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead className="font-bold">Net Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
                            ) : payroll.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(item.month + '-01'), 'MMMM yyyy')}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell>{item.users?.email}</TableCell>
                                    )}
                                    <TableCell>{item.currency || 'USD'} {item.base_salary}</TableCell>
                                    <TableCell className="text-green-600">+{item.bonuses}</TableCell>
                                    <TableCell className="text-red-600">-{item.deductions}</TableCell>
                                    <TableCell className="font-bold text-lg">{item.currency || 'USD'} {item.net_salary || (item.base_salary + item.bonuses - item.deductions)}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'Paid' ? 'secondary' : 'outline'} className={item.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
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

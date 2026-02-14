'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Calendar, Download } from 'lucide-react'

export default function AdminAttendancePage() {
    const [attendance, setAttendance] = useState([])
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/attendance?admin=true&date=${date}`)
                if (res.ok) {
                    const { attendance: data } = await res.json()
                    setAttendance(data || [])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [date])

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Attendance</h1>
                    <p className="text-slate-500">Monitor employee check-ins and working hours.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-40"
                    />
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Records ({format(new Date(date), 'MMM dd, yyyy')})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading records...</div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No attendance records found for this date.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Total Hours</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendance.map((record: any) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {record.users?.email || 'Unknown User'}
                                            {/* If profiles joined: {record.profiles?.first_name} */}
                                        </TableCell>
                                        <TableCell>
                                            {record.clock_in ? format(new Date(record.clock_in), 'h:mm a') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {record.clock_out ? format(new Date(record.clock_out), 'h:mm a') : 'Working...'}
                                        </TableCell>
                                        <TableCell>{record.total_hours || '-'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                    record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

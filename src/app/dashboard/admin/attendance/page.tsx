'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { AttendanceWidget } from '@/components/dashboard/employee/attendance-widget'
import {
  Clock,
  Calendar,
  Download,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  RefreshCw,
  PlusCircle,
  Search,
  Filter
} from 'lucide-react'

interface AttendanceRecord {
  id: string
  user_id: string
  employee_name?: string
  employee_email?: string
  date: string
  clock_in?: string
  clock_out?: string
  total_hours?: number
  status: string
  users?: {
    email?: string
    first_name?: string
    last_name?: string
  }
}

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Clock In / Attendance Action Modal
  const [isClockInOpen, setIsClockInOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clockInUserEmail, setClockInUserEmail] = useState('')
  const [clockInStatus, setClockInStatus] = useState('Present')

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/attendance?admin=true&date=${date}`)
      if (res.ok) {
        const { attendance: data } = await res.json()
        setAttendance(data || [])
      }
    } catch (e) {
      console.error('Error fetching attendance:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [date])

  const getEmployeeName = (record: AttendanceRecord) => {
    if (record.employee_name && !record.employee_name.startsWith('Staff #')) {
      return record.employee_name
    }
    const u = record.users
    if (u?.first_name || u?.last_name) {
      return `${u.first_name || ''} ${u.last_name || ''}`.trim()
    }
    if (u?.email && u.email !== 'Unknown' && u.email !== 'N/A') {
      return u.email.split('@')[0]
    }
    return record.employee_email || `Employee #${record.user_id ? record.user_id.slice(0, 8) : 'N/A'}`
  }

  const getEmployeeEmail = (record: AttendanceRecord) => {
    if (record.employee_email && record.employee_email !== 'N/A') return record.employee_email
    if (record.users?.email && record.users.email !== 'Unknown') return record.users.email
    return 'N/A'
  }

  const filteredAttendance = useMemo(() => {
    return attendance.filter((rec) => {
      const name = getEmployeeName(rec).toLowerCase()
      const email = getEmployeeEmail(rec).toLowerCase()
      const search = searchQuery.toLowerCase()

      const matchesSearch = searchQuery === '' || name.includes(search) || email.includes(search)
      const matchesStatus = statusFilter === 'all' || rec.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [attendance, searchQuery, statusFilter])

  // Summary Metrics
  const totalCheckedIn = attendance.length
  const currentlyWorking = attendance.filter(r => r.clock_in && !r.clock_out).length
  const presentCount = attendance.filter(r => r.status === 'Present').length
  const lateCount = attendance.filter(r => r.status === 'Late').length

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Employee Name,Email,Date,Clock In,Clock Out,Total Hours,Status',
        ...filteredAttendance.map(r =>
          `"${getEmployeeName(r)}","${getEmployeeEmail(r)}","${r.date}","${r.clock_in || 'N/A'}","${r.clock_out || 'N/A'}","${r.total_hours || 0}","${r.status}"`
        )
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `syncflo-staff-attendance-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAdminClockIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock_in',
          status: clockInStatus,
        })
      })

      if (res.ok) {
        setIsClockInOpen(false)
        fetchAttendance()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to clock in')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeSafe = (timeStr?: string) => {
    if (!timeStr) return '-'
    try {
      return format(new Date(timeStr), 'h:mm a')
    } catch (e) {
      return timeStr
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-white rounded-xl shadow-md">
              <Clock className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Staff Attendance OS
              </h1>
              <p className="text-slate-500 mt-0.5 text-sm font-medium">
                Monitor daily employee check-ins, working duration, and attendance logs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40 h-9 text-xs bg-white border-slate-300 font-semibold"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
            className="h-9 text-xs font-semibold text-slate-700"
          >
            Today
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold text-slate-800 border-slate-300 gap-1.5 hover:bg-slate-100"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAttendance}
            disabled={loading}
            className="h-9 gap-1 text-slate-700 font-semibold"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Clock In Widget + Metrics Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AttendanceWidget />
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Checked In</p>
                <p className="text-3xl font-extrabold text-slate-950 mt-1">{totalCheckedIn}</p>
                <p className="text-xs text-slate-500 mt-0.5">Logged for {date}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
                <UserCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Currently Working</p>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1">{currentlyWorking}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Active shift ongoing</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-600">On Time Arrival</p>
                <p className="text-3xl font-extrabold text-sky-700 mt-1">{presentCount}</p>
                <p className="text-xs text-sky-600 mt-0.5">Arrived on schedule</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Late Arrivals</p>
                <p className="text-3xl font-extrabold text-amber-700 mt-1">{lateCount}</p>
                <p className="text-xs text-amber-600 mt-0.5">Logged past shift start</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance Directory Table */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Daily Attendance Logs ({format(new Date(date), 'MMM dd, yyyy')})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Staff check-in times, shift completion, and total working hours
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search staff, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 w-48 bg-white border-slate-200"
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
                  onClick={() => setStatusFilter('present')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'present' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Present
                </button>
                <button
                  onClick={() => setStatusFilter('late')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === 'late' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Late
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table className="text-xs">
            <TableHeader className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <TableRow>
                <TableHead className="py-3">Employee</TableHead>
                <TableHead className="py-3">Clock In</TableHead>
                <TableHead className="py-3">Clock Out</TableHead>
                <TableHead className="py-3">Total Hours</TableHead>
                <TableHead className="py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                    <RefreshCw className="h-6 w-6 mx-auto animate-spin text-emerald-600 mb-2" />
                    Loading attendance records for {format(new Date(date), 'MMM dd, yyyy')}...
                  </TableCell>
                </TableRow>
              ) : filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30 stroke-[1.5]" />
                    <p className="text-sm font-bold text-slate-800">No attendance records found for this date</p>
                    <p className="text-xs text-slate-500 mt-1">Select another date or click "Today" to view check-ins.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="py-3.5">
                      <div>
                        <div className="font-bold text-slate-900">{getEmployeeName(record)}</div>
                        <div className="text-slate-500 text-[11px]">{getEmployeeEmail(record)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 font-semibold text-slate-800">
                      {formatTimeSafe(record.clock_in)}
                    </TableCell>
                    <TableCell className="py-3.5 font-semibold text-slate-800">
                      {record.clock_out ? (
                        formatTimeSafe(record.clock_out)
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          Shift Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 font-mono font-bold text-slate-950">
                      {record.total_hours ? `${record.total_hours} hrs` : '-'}
                    </TableCell>
                    <TableCell className="py-3.5">
                      {record.status === 'Present' && (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold uppercase text-[10px]">
                          ✓ Present
                        </Badge>
                      )}
                      {record.status === 'Late' && (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-extrabold uppercase text-[10px]">
                          ⚠ Late
                        </Badge>
                      )}
                      {record.status !== 'Present' && record.status !== 'Late' && (
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-bold uppercase text-[10px]">
                          {record.status}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

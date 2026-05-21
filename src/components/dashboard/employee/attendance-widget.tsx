'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Fingerprint, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

export function AttendanceWidget() {
    const [clockedIn, setClockedIn] = useState(false)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const [duration, setDuration] = useState('00:00:00')
    const [loading, setLoading] = useState(true)

    // Fetch initial status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/admin/attendance')
                if (res.ok) {
                    const { attendance } = await res.json()
                    // API returns an array now
                    const record = Array.isArray(attendance) ? attendance[0] : attendance

                    if (record) {
                        if (record.clock_out) {
                            // Already finished today
                            setClockedIn(false)
                            setStartTime(null)
                            // Optionally show total hours
                        } else {
                            // Currently clocked in
                            setClockedIn(true)
                            setStartTime(new Date(record.clock_in))
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
    }, [])

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (clockedIn && startTime) {
            interval = setInterval(() => {
                const now = new Date()
                const diff = now.getTime() - startTime.getTime()
                const hours = Math.floor(diff / 3600000)
                const minutes = Math.floor((diff % 3600000) / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setDuration(
                    `${hours.toString().padStart(2, '0')}:${minutes
                        .toString()
                        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                )
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [clockedIn, startTime])

    const handleClock = async () => {
        setLoading(true)
        try {
            const action = clockedIn ? 'clock_out' : 'clock_in'
            const res = await fetch('/api/admin/attendance', {
                method: 'POST',
                body: JSON.stringify({ action }),
                headers: { 'Content-Type': 'application/json' }
            })

            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Failed to update attendance')
                return
            }

            const { data } = await res.json()

            if (action === 'clock_in') {
                setClockedIn(true)
                setStartTime(new Date(data.clock_in))
            } else {
                setClockedIn(false)
                setStartTime(null)
                setDuration('00:00:00')
            }
        } catch (e) {
            console.error(e)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
        >
        <Card className="premium-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-slate-950">Attendance</CardTitle>
                <div className={`rounded-full px-2.5 py-1 text-xs font-bold ${clockedIn ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                    {clockedIn ? 'PRESENT' : 'AWAY'}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
                <div className="text-center">
                    <p className="mb-1 text-sm font-semibold text-slate-500">Current Session</p>
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-4xl font-bold tracking-normal text-slate-950 shadow-inner">
                        {duration}
                    </div>
                </div>

                <Button
                    size="lg"
                    disabled={loading}
                    className={`h-14 w-full text-lg shadow-md transition-all ${clockedIn
                        ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-emerald-700 text-white shadow-emerald-500/20 hover:bg-emerald-800'
                        }`}
                    onClick={handleClock}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : clockedIn ? (
                        <>
                            <Clock className="mr-2 h-5 w-5" /> Clock Out
                        </>
                    ) : (
                        <>
                            <Fingerprint className="mr-2 h-5 w-5" /> Clock In
                        </>
                    )}
                </Button>

                {startTime && (
                    <p className="text-xs font-medium text-slate-400">
                        Started at {format(startTime, 'h:mm a')}
                    </p>
                )}
            </CardContent>
        </Card>
        </motion.div>
    )
}

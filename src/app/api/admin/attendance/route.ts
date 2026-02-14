import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const dateParam = searchParams.get('date')

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let query = supabase.from('admin_attendance').select('*').order('date', { ascending: false })

        if (isAdmin) {
            if (dateParam) {
                query = query.eq('date', dateParam)
            } else {
                // Default to today
                query = query.eq('date', new Date().toISOString().split('T')[0])
            }
        } else {
            query = query.eq('user_id', user.id)
            if (dateParam) {
                query = query.eq('date', dateParam)
            } else {
                query = query.eq('date', new Date().toISOString().split('T')[0])
            }
        }

        const { data: attendanceData, error } = await query
        if (error) {
            console.error('DEBUG: DB Query Error', error)
            throw error
        }

        // Manual join with profiles
        const userIds = [...new Set(attendanceData.map((r: any) => r.user_id))]
        const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)

        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
            acc[p.id] = p
            return acc
        }, {})

        const data = attendanceData.map((r: any) => ({
            ...r,
            users: profileMap[r.user_id] || { email: 'Unknown' }
        }))

        return NextResponse.json({ attendance: data })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { action } = await request.json() // 'clock_in' or 'clock_out'
        const today = new Date().toISOString().split('T')[0]

        if (action === 'clock_in') {
            // Check if already clocked in
            const { data: existing } = await supabase
                .from('admin_attendance')
                .select('id')
                .eq('user_id', user.id)
                .eq('date', today)
                .maybeSingle()

            if (existing) {
                return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 })
            }

            const { data, error } = await supabase
                .from('admin_attendance')
                .insert({
                    user_id: user.id,
                    date: today,
                    clock_in: new Date().toISOString(),
                    status: 'Present'
                })
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ data })
        }

        if (action === 'clock_out') {
            // Find today's record
            const { data: existing } = await supabase
                .from('admin_attendance')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .single()

            if (!existing) {
                return NextResponse.json({ error: 'No clock-in record found for today' }, { status: 400 })
            }

            if (existing.clock_out) {
                return NextResponse.json({ error: 'Already clocked out' }, { status: 400 })
            }

            // Calculate total hours
            const clockInTime = new Date(existing.clock_in).getTime()
            const clockOutTime = new Date().getTime()
            const hours = (clockOutTime - clockInTime) / (1000 * 60 * 60) // hours

            const { data, error } = await supabase
                .from('admin_attendance')
                .update({
                    clock_out: new Date().toISOString(),
                    total_hours: parseFloat(hours.toFixed(2))
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ data })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Attendance Error:', error)
        return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
    }
}

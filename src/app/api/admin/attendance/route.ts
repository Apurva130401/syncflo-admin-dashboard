import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const dateParam = searchParams.get('date')

    try {
        const authSupabase = await createServerClient()
        const { data: { user } } = await authSupabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let query = supabase.from('admin_attendance').select('*').order('date', { ascending: false })

        if (isAdmin) {
            if (dateParam && dateParam !== 'all') {
                query = query.eq('date', dateParam)
            }
        } else {
            query = query.eq('user_id', user.id)
            if (dateParam && dateParam !== 'all') {
                query = query.eq('date', dateParam)
            }
        }

        const { data: attendanceData, error } = await query
        if (error) {
            console.error('Attendance Query Error:', error)
            throw error
        }

        // 1. Get unique user IDs
        const userIds = [...new Set((attendanceData || []).map((r: any) => r.user_id).filter(Boolean))]

        // 2. Fetch profiles from public.profiles
        let userProfiles: { [key: string]: any } = {}
        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, company_name')
                .in('id', userIds)

            if (profiles) {
                userProfiles = profiles.reduce((acc, p) => {
                    acc[p.id] = p
                    return acc
                }, {} as { [key: string]: any })
            }
        }

        // 3. Fetch Supabase Auth users fallback
        let authUserMap: { [key: string]: any } = {}
        try {
            const { data: authData } = await supabase.auth.admin.listUsers()
            if (authData?.users) {
                for (const u of authData.users) {
                    authUserMap[u.id] = {
                        id: u.id,
                        email: u.email,
                        first_name: u.user_metadata?.first_name || u.user_metadata?.full_name?.split(' ')[0] || '',
                        last_name: u.user_metadata?.last_name || u.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    }
                }
            }
        } catch (e) {
            console.error('Auth users fallback error:', e)
        }

        // 4. Map user info cleanly
        const data = (attendanceData || []).map((r: any) => {
            const profile = userProfiles[r.user_id] || authUserMap[r.user_id] || null
            const name = profile
                ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email
                : `Staff #${r.user_id?.slice(0, 8) || 'N/A'}`

            return {
                ...r,
                employee_name: name,
                employee_email: profile?.email || 'N/A',
                users: profile || { email: profile?.email || 'N/A' }
            }
        })

        return NextResponse.json({ attendance: data })
    } catch (error) {
        console.error('Attendance API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const authSupabase = await createServerClient()
        const { data: { user } } = await authSupabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { action, target_user_id, status } = body
        const today = new Date().toISOString().split('T')[0]
        const effectiveUserId = target_user_id || user.id

        if (action === 'clock_in') {
            const { data: existing } = await supabase
                .from('admin_attendance')
                .select('id')
                .eq('user_id', effectiveUserId)
                .eq('date', today)
                .maybeSingle()

            if (existing) {
                return NextResponse.json({ error: 'Already clocked in for today' }, { status: 400 })
            }

            const { data, error } = await supabase
                .from('admin_attendance')
                .insert({
                    user_id: effectiveUserId,
                    date: today,
                    clock_in: new Date().toISOString(),
                    status: status || 'Present'
                })
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ success: true, data })
        }

        if (action === 'clock_out') {
            const { data: existing } = await supabase
                .from('admin_attendance')
                .select('*')
                .eq('user_id', effectiveUserId)
                .eq('date', today)
                .single()

            if (!existing) {
                return NextResponse.json({ error: 'No clock-in record found for today' }, { status: 400 })
            }

            if (existing.clock_out) {
                return NextResponse.json({ error: 'Already clocked out' }, { status: 400 })
            }

            const clockInTime = new Date(existing.clock_in).getTime()
            const clockOutTime = new Date().getTime()
            const hours = (clockOutTime - clockInTime) / (1000 * 60 * 60)

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
            return NextResponse.json({ success: true, data })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Attendance POST Error:', error)
        return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
    }
}

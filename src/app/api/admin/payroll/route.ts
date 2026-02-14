import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const role = profile?.role || 'user'

        let query = supabase.from('admin_payroll').select('*').order('created_at', { ascending: false })

        if (['admin', 'accountant'].includes(role)) {
            // Fetch all
        } else {
            // Fetch own
            query = query.eq('user_id', user.id)
        }

        const { data: payrollData, error } = await query
        if (error) throw error

        // Manual join
        const userIds = [...new Set(payrollData.map((r: any) => r.user_id))]
        const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)

        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
            acc[p.id] = p
            return acc
        }, {})

        const data = payrollData.map((r: any) => ({
            ...r,
            users: profileMap[r.user_id] || { email: 'Unknown' }
        }))

        return NextResponse.json({ payroll: data })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Only Admin/Accountant can create
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (!['admin', 'accountant'].includes(profile?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { user_id, month, base_salary, bonuses, deductions, status } = body

        const { data, error } = await supabase
            .from('admin_payroll')
            .insert({
                user_id,
                month,
                base_salary,
                bonuses,
                deductions,
                deductions,
                status: status || 'Pending',
                currency: body.currency || 'USD',
                payment_date: status === 'Paid' ? new Date().toISOString() : null
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ payroll: data })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create payroll' }, { status: 500 })
    }
}

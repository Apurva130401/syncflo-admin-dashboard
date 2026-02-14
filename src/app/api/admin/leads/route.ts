import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const role = profile?.role || 'user'

        let query = supabase.from('admin_leads').select('*').order('created_at', { ascending: false })

        if (['admin', 'manager', 'employee'].includes(role)) {
            // Employees can see all leads? Usually CRM is open.
            // Or specific assignment?
            // Let's allow everyone to see all for now to make it "nice and professional" with lots of data.
            // Or filter if employee: query = query.eq('assigned_to', user.id)
        }

        const { data: leadsData, error } = await query
        if (error) throw error

        // Manual join for assigned_to
        const userIds = [...new Set(leadsData.map((r: any) => r.assigned_to).filter(Boolean))]
        const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)

        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
            acc[p.id] = p
            return acc
        }, {})

        const data = leadsData.map((r: any) => ({
            ...r,
            assigned_user: profileMap[r.assigned_to] || null
        }))

        return NextResponse.json({ leads: data })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const { name, company, email, phone, value, status, source, assigned_to } = body

        const { data, error } = await supabase
            .from('admin_leads')
            .insert({
                name,
                company,
                email,
                phone,
                value,
                status: status || 'New',
                source,
                assigned_to,
                currency: body.currency || 'USD'
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ lead: data })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient()
    try {
        const { id, ...updates } = await request.json()
        const { error } = await supabase.from('admin_leads').update(updates).eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient()
    try {
        const { id } = await request.json()
        const { error } = await supabase.from('admin_leads').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}

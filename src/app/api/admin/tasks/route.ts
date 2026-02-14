import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const role = profile?.role || 'user'

        let query = supabase.from('admin_tasks').select('*').order('created_at', { ascending: false })

        if (['admin', 'manager'].includes(role)) {
            // Fetch all
        } else {
            // Fetch assigned only
            query = query.eq('assigned_to', user.id)
        }

        const { data: tasksData, error } = await query
        if (error) throw error

        // Manual join
        const userIds = [...new Set(tasksData.map((r: any) => r.assigned_to).filter(Boolean))]
        const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)

        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
            acc[p.id] = p
            return acc
        }, {})

        const data = tasksData.map((r: any) => ({
            ...r,
            assigned_user: profileMap[r.assigned_to] || null
        }))

        return NextResponse.json({ tasks: data })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Only Admin/Manager can create tasks usually, or maybe employees can create for themselves?
        // Let's allow everyone to create, but usually admins assign.

        const body = await request.json()
        const { title, description, priority, assigned_to, due_date } = body

        const { data, error } = await supabase
            .from('admin_tasks')
            .insert({
                title,
                description,
                priority,
                assigned_to: assigned_to || user.id, // Self-assign if empty
                due_date,
                status: 'Todo'
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ task: data })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient()
    try {
        const { id, ...updates } = await request.json()
        const { error } = await supabase.from('admin_tasks').update(updates).eq('id', id)
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
        const { error } = await supabase.from('admin_tasks').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}

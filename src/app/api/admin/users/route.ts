import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, role, created_at, updated_at')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ users: data })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { userId, role } = await request.json()

        const { data, error } = await supabase
            .from('profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating user role:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ user: data })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await request.json()

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (error) {
            console.error('Error deleting user:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
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
            .select('*')
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

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // 1. Permanently delete user from Supabase Auth (auth.users)
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)

        if (authError) {
            console.error('Error deleting auth user from Supabase auth.users:', authError)
        }

        // 2. Permanently delete user profile from public.profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError && authError) {
            console.error('Error deleting user profile:', profileError)
            return NextResponse.json(
                { error: profileError.message || authError?.message || 'Failed to delete user' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Server error during user deletion:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
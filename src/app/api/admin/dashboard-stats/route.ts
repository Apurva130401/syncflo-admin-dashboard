import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const allowedRoles = ['admin', 'manager', 'support', 'accountant', 'developer']

const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        const authSupabase = await createServerClient()
        const { data: { user }, error: authError } = await authSupabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile, error: profileError } = await authSupabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile || !allowedRoles.includes(profile.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const [
            totalUsers,
            activeUsers,
            pendingVerifications,
            openTickets,
        ] = await Promise.all([
            serviceSupabase.from('profiles').select('id', { count: 'exact', head: true }),
            serviceSupabase
                .from('profiles')
                .select('id', { count: 'exact', head: true })
                .gte('updated_at', thirtyDaysAgo.toISOString()),
            serviceSupabase
                .from('business_verification')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'pending'),
            serviceSupabase
                .from('support_tickets')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'open'),
        ])

        const firstError = [
            totalUsers.error,
            activeUsers.error,
            pendingVerifications.error,
            openTickets.error,
        ].find(Boolean)

        if (firstError) {
            console.error('Error fetching dashboard stats:', firstError)
            return NextResponse.json({ error: firstError.message }, { status: 500 })
        }

        return NextResponse.json({
            totalUsers: totalUsers.count ?? 0,
            activeUsers: activeUsers.count ?? 0,
            pendingVerifications: pendingVerifications.count ?? 0,
            openTickets: openTickets.count ?? 0,
        })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

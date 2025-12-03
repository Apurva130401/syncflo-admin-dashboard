import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        // First, get all subscriptions
        const { data: subscriptions, error: subscriptionsError } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false })

        if (subscriptionsError) {
            console.error('Error fetching subscriptions:', subscriptionsError)
            return NextResponse.json({ error: subscriptionsError.message }, { status: 500 })
        }

        // Get unique user IDs from subscriptions
        const userIds = [...new Set((subscriptions || []).map(sub => sub.user_id).filter(Boolean))]

        // Fetch user profiles if there are any user IDs
        let userProfiles: { [key: string]: any } = {}
        if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name')
                .in('id', userIds)

            if (!profilesError && profiles) {
                userProfiles = profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile
                    return acc
                }, {} as { [key: string]: any })
            }
        }

        // Transform the data to include user profile
        const subscriptionsWithProfiles = (subscriptions || []).map(subscription => ({
            ...subscription,
            profiles: userProfiles[subscription.user_id] || null
        }))

        return NextResponse.json({ subscriptions: subscriptionsWithProfiles })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
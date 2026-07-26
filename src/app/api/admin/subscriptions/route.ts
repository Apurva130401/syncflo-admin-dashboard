import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        // 1. Get all subscriptions
        const { data: subscriptions, error: subscriptionsError } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false })

        if (subscriptionsError) {
            console.error('Error fetching subscriptions:', subscriptionsError)
            return NextResponse.json({ error: subscriptionsError.message }, { status: 500 })
        }

        // 2. Get unique user IDs
        const userIds = [...new Set((subscriptions || []).map(sub => sub.user_id).filter(Boolean))]

        // 3. Fetch user profiles from public.profiles table
        let userProfiles: { [key: string]: any } = {}
        if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name, company_name')
                .in('id', userIds)

            if (!profilesError && profiles) {
                userProfiles = profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile
                    return acc
                }, {} as { [key: string]: any })
            }
        }

        // 4. Fetch Supabase Auth users to fill in any missing profile emails/names
        let authUserMap: { [key: string]: any } = {}
        try {
            const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
            if (!authError && authData?.users) {
                authUsersLoop: for (const u of authData.users) {
                    authUserMap[u.id] = {
                        id: u.id,
                        email: u.email,
                        first_name: u.user_metadata?.first_name || u.user_metadata?.full_name?.split(' ')[0] || '',
                        last_name: u.user_metadata?.last_name || u.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    }
                }
            }
        } catch (e) {
            console.error('Auth users list error:', e)
        }

        // 5. Transform subscriptions with normalized fields and fallback profile matching
        const subscriptionsWithProfiles = (subscriptions || []).map(subscription => {
            const matchedProfile = userProfiles[subscription.user_id] || authUserMap[subscription.user_id] || null

            // Normalize plan name
            const plan =
                subscription.current_plan ||
                subscription.plan_id ||
                subscription.whatsapp_plan_id ||
                subscription.voice_plan_id ||
                subscription.plan_name ||
                subscription.plan ||
                (subscription.subscription_status === 'trial' ? 'Free Trial' : 'N/A')

            // Normalize status
            const status = subscription.subscription_status || subscription.status || 'inactive'

            // Normalize billing cycle
            const billingCycle =
                subscription.billing_cycle ||
                subscription.interval ||
                subscription.billing_type ||
                (status === 'trial' ? 'Trial' : 'N/A')

            return {
                ...subscription,
                current_plan: plan,
                subscription_status: status,
                billing_cycle: billingCycle,
                profiles: matchedProfile
                    ? matchedProfile
                    : subscription.user_email || subscription.email
                    ? { id: subscription.user_id, email: subscription.user_email || subscription.email }
                    : { id: subscription.user_id, email: `User #${subscription.user_id ? subscription.user_id.slice(0, 8) : 'N/A'}` }
            }
        })

        return NextResponse.json({ subscriptions: subscriptionsWithProfiles })
    } catch (error) {
        console.error('Server error in subscriptions API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
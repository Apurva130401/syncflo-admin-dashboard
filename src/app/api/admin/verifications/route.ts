import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        // Fetch verifications with user profile data
        // 1. Fetch verifications
        const { data: verificationsData, error: verificationsError } = await supabase
            .from('business_verification')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (verificationsError) {
            console.error('Error fetching verifications:', verificationsError)
            return NextResponse.json({ error: verificationsError.message }, { status: 500 })
        }

        if (!verificationsData || verificationsData.length === 0) {
            return NextResponse.json({ verifications: [] })
        }

        // 2. Fetch profiles for these users
        const userIds = Array.from(new Set(verificationsData.map((v: any) => v.user_id)))

        // Fetch profiles, ignoring errors if some profiles are missing
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, company_name, email')
            .in('id', userIds)

        // 3. Map profiles to verifications
        const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
            acc[profile.id] = profile
            return acc
        }, {})

        const joinedData = verificationsData.map((v: any) => ({
            ...v,
            profiles: profilesMap[v.user_id] || null
        }))



        // Sort locally to ensure 'pending' comes first, then by date
        const sortedData = [...(joinedData || [])].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1
            if (a.status !== 'pending' && b.status === 'pending') return 1
            return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        })

        return NextResponse.json({ verifications: sortedData })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { id, action, rejection_reason, admin_notes } = await request.json()

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const updates: any = {
            updated_at: new Date().toISOString()
        }

        if (admin_notes !== undefined) {
            updates.admin_notes = admin_notes
        }

        if (action === 'approve') {
            updates.status = 'verified'
            updates.verified_at = new Date().toISOString()
            updates.rejection_reason = null // Clear any previous rejection reason
        } else if (action === 'reject') {
            if (!rejection_reason) {
                return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
            }
            updates.status = 'rejected'
            updates.rejection_reason = rejection_reason
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('business_verification')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating verification:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ verification: data })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

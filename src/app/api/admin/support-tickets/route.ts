import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        // First, get all support tickets
        const { data: tickets, error: ticketsError } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })

        if (ticketsError) {
            console.error('Error fetching support tickets:', ticketsError)
            return NextResponse.json({ error: ticketsError.message }, { status: 500 })
        }

        // Get unique user IDs from tickets
        const userIds = [...new Set((tickets || []).map(ticket => ticket.user_id).filter(Boolean))]

        // Fetch user emails if there are any user IDs
        let userEmails: { [key: string]: string } = {}
        if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email')
                .in('id', userIds)

            if (!profilesError && profiles) {
                userEmails = profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile.email
                    return acc
                }, {} as { [key: string]: string })
            }
        }

        // Transform the data to include user_email
        const ticketsWithEmail = (tickets || []).map(ticket => ({
            ...ticket,
            user_email: userEmails[ticket.user_id] || 'Unknown User'
        }))

        return NextResponse.json({ tickets: ticketsWithEmail })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { ticketId, status } = await request.json()

        const { data, error } = await supabase
            .from('support_tickets')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticketId)
            .select()
            .single()

        if (error) {
            console.error('Error updating ticket status:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ ticket: data })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
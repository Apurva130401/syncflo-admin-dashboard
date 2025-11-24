import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        // Get the latest system health record
        const { data, error } = await supabase
            .from('system_health')
            .select('id, health, status, uptime, response_time, active_alerts, last_updated')
            .order('last_updated', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching system health:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // If no data exists, return default values
        const defaultHealth = {
            id: 'default',
            health: 'healthy',
            status: 'operational',
            uptime: 99.9,
            response_time: 120,
            active_alerts: 0,
            last_updated: new Date().toISOString()
        }

        return NextResponse.json({ health: data || defaultHealth })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const updates = await request.json()

        // Map the incoming updates to the correct column names
        const dbUpdates: any = {
            last_updated: new Date().toISOString()
        }

        if (updates.health !== undefined) dbUpdates.health = updates.health
        if (updates.status !== undefined) dbUpdates.status = updates.status
        if (updates.uptime !== undefined) dbUpdates.uptime = updates.uptime
        if (updates.response_time !== undefined) dbUpdates.response_time = updates.response_time
        if (updates.active_alerts !== undefined) dbUpdates.active_alerts = updates.active_alerts

        // First, check if a system_health record exists
        const { data: existing } = await supabase
            .from('system_health')
            .select('id')
            .limit(1)
            .single()

        let result

        if (existing) {
            // Update existing record
            const { data, error } = await supabase
                .from('system_health')
                .update(dbUpdates)
                .eq('id', existing.id)
                .select('id, health, status, uptime, response_time, active_alerts, last_updated')
                .single()

            if (error) {
                console.error('Error updating system health:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            result = data
        } else {
            // Create new record
            const { data, error } = await supabase
                .from('system_health')
                .insert(dbUpdates)
                .select('id, health, status, uptime, response_time, active_alerts, last_updated')
                .single()

            if (error) {
                console.error('Error creating system health:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            result = data
        }

        return NextResponse.json({ health: result })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
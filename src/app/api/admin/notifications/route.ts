import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Notification, NotificationCategory, NotificationPriority, NotificationType } from '@/types/notification'

const allowedRoles = ['admin', 'manager', 'support', 'accountant', 'developer', 'super_admin']

const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

export async function GET() {
    try {
        const authSupabase = await createServerClient()
        const { data: { user }, error: authError } = await authSupabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await authSupabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !allowedRoles.includes(profile.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const realNotifications: Notification[] = []

        // 1. Support Tickets
        try {
            const { data: tickets } = await serviceSupabase
                .from('support_tickets')
                .select('id, subject, status, priority, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(10)

            if (tickets) {
                tickets.forEach((t: any) => {
                    const isCritical = t.priority === 'urgent' || t.priority === 'high'
                    realNotifications.push({
                        id: `ticket-${t.id}`,
                        title: `Ticket #${t.id.slice(0, 6)}: ${t.subject || 'Support Request'}`,
                        message: `Status: ${t.status || 'open'}. Priority: ${t.priority || 'normal'}.`,
                        type: isCritical ? 'error' : 'info',
                        category: 'support',
                        priority: isCritical ? 'critical' : 'medium',
                        timestamp: t.created_at || new Date().toISOString(),
                        read: false,
                        actionUrl: '/dashboard/support-tickets',
                        meta: { sourceTable: 'support_tickets', rawId: t.id }
                    })
                })
            }
        } catch (e) {
            console.error('Error fetching support tickets for notifications:', e)
        }

        // 2. Business Verifications
        try {
            const { data: verifications } = await serviceSupabase
                .from('business_verification')
                .select('id, business_name, status, created_at')
                .order('created_at', { ascending: false })
                .limit(10)

            if (verifications) {
                verifications.forEach((v: any) => {
                    const isPending = v.status === 'pending'
                    realNotifications.push({
                        id: `verification-${v.id}`,
                        title: `Business Verification: ${v.business_name || 'Pending Application'}`,
                        message: `Verification status is currently ${v.status || 'pending'}. Action required for approval.`,
                        type: isPending ? 'warning' : 'success',
                        category: 'users',
                        priority: isPending ? 'high' : 'low',
                        timestamp: v.created_at || new Date().toISOString(),
                        read: false,
                        actionUrl: '/dashboard/verifications',
                        meta: { sourceTable: 'business_verification', rawId: v.id }
                    })
                })
            }
        } catch (e) {
            console.error('Error fetching verifications for notifications:', e)
        }

        // 3. Contact Inquiries
        try {
            const { data: inquiries } = await serviceSupabase
                .from('contact_submissions')
                .select('id, name, email, subject, created_at')
                .order('created_at', { ascending: false })
                .limit(10)

            if (inquiries) {
                inquiries.forEach((inq: any) => {
                    realNotifications.push({
                        id: `inquiry-${inq.id}`,
                        title: `Inquiry from ${inq.name || inq.email || 'Website Visitor'}`,
                        message: inq.subject ? `Subject: "${inq.subject}"` : `New custom enquiry received.`,
                        type: 'info',
                        category: 'support',
                        priority: 'medium',
                        timestamp: inq.created_at || new Date().toISOString(),
                        read: false,
                        actionUrl: '/dashboard/inquiries',
                        meta: { sourceTable: 'contact_submissions', rawId: inq.id }
                    })
                })
            }
        } catch (e) {
            console.error('Error fetching contact submissions for notifications:', e)
        }

        // 4. Admin Tasks
        try {
            const { data: tasks } = await serviceSupabase
                .from('admin_tasks')
                .select('id, title, status, priority, created_at')
                .order('created_at', { ascending: false })
                .limit(10)

            if (tasks) {
                tasks.forEach((tsk: any) => {
                    const isPending = tsk.status !== 'completed'
                    realNotifications.push({
                        id: `task-${tsk.id}`,
                        title: `Task: ${tsk.title || 'Untitled Task'}`,
                        message: `Task status: ${tsk.status || 'pending'}. Assigned priority: ${tsk.priority || 'medium'}.`,
                        type: isPending ? 'warning' : 'success',
                        category: 'tasks',
                        priority: (tsk.priority as NotificationPriority) || 'medium',
                        timestamp: tsk.created_at || new Date().toISOString(),
                        read: false,
                        actionUrl: '/dashboard/tasks',
                        meta: { sourceTable: 'admin_tasks', rawId: tsk.id }
                    })
                })
            }
        } catch (e) {
            console.error('Error fetching tasks for notifications:', e)
        }

        // 5. System Health
        try {
            const { data: health } = await serviceSupabase
                .from('system_health')
                .select('id, service_name, status, cpu_usage, memory_usage, created_at')
                .order('created_at', { ascending: false })
                .limit(5)

            if (health) {
                health.forEach((h: any) => {
                    const isUnhealthy = h.status !== 'healthy' || (h.cpu_usage && h.cpu_usage > 85)
                    realNotifications.push({
                        id: `system-${h.id}`,
                        title: `System Node: ${h.service_name || 'Cluster Server'}`,
                        message: `Status: ${h.status || 'unknown'}. CPU: ${h.cpu_usage || 0}%, RAM: ${h.memory_usage || 0}%.`,
                        type: isUnhealthy ? 'error' : 'info',
                        category: 'system',
                        priority: isUnhealthy ? 'critical' : 'low',
                        timestamp: h.created_at || new Date().toISOString(),
                        read: false,
                        actionUrl: '/dashboard/monitoring',
                        meta: { sourceTable: 'system_health', rawId: h.id }
                    })
                })
            }
        } catch (e) {
            console.error('Error fetching system health for notifications:', e)
        }

        // 6. User Profiles (New Registrations)
        try {
            const { data: users } = await serviceSupabase
                .from('profiles')
                .select('id, first_name, last_name, email, created_at')
                .order('created_at', { ascending: false })
                .limit(10)

            if (users) {
                users.forEach((u: any) => {
                    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'New User'
                    realNotifications.push({
                        id: `user-${u.id}`,
                        title: `New Registration: ${name}`,
                        message: `User signed up with email ${u.email || 'N/A'}. Account pending activation.`,
                        type: 'info',
                        category: 'users',
                        priority: 'low',
                        timestamp: u.created_at || new Date().toISOString(),
                        read: false,
                        actionUrl: '/dashboard/users',
                        meta: { sourceTable: 'profiles', rawId: u.id }
                    })
                })
            }
        } catch (e) {
            console.error('Error fetching user profiles for notifications:', e)
        }

        // Sort all real notifications descending by timestamp
        realNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        return NextResponse.json({
            notifications: realNotifications,
            count: realNotifications.length,
            syncedAt: new Date().toISOString()
        })
    } catch (error) {
        console.error('Server error in notifications route:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

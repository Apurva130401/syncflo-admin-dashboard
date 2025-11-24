import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: ticketId } = await params

        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set(name, value, options)
                    },
                    remove(name: string, options: any) {
                        cookieStore.set(name, '', { ...options, maxAge: 0 })
                    }
                }
            }
        )

        const { data: messages, error } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching messages:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ messages })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: ticketId } = await params
        const { message } = await request.json()

        if (!message || message.trim() === '') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set(name, value, options)
                    },
                    remove(name: string, options: any) {
                        cookieStore.set(name, '', { ...options, maxAge: 0 })
                    }
                }
            }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('ticket_messages')
            .insert({
                ticket_id: ticketId,
                sender_id: user.id,
                sender_type: 'admin',
                message: message.trim()
            })
            .select()
            .single()

        if (error) {
            console.error('Error sending message:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: data })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
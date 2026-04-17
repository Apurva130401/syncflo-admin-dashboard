'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Send, Paperclip } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
    id: string
    ticket_id: string
    sender_id: string
    sender_type: 'user' | 'admin'
    message: string
    created_at: string
    is_read: boolean
}

interface TicketChatProps {
    ticketId: string
}

export default function TicketChat({ ticketId }: TicketChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        fetchMessages()
    }, [ticketId])

    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel(`ticket_messages_${ticketId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ticket_messages',
                filter: `ticket_id=eq.${ticketId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        const exists = prev.some(m => m.id === newMsg.id)
                        if (exists) return prev
                        return [...prev, newMsg]
                    })
                } else if (payload.eventType === 'UPDATE') {
                    const updatedMsg = payload.new as Message
                    setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
                } else if (payload.eventType === 'DELETE') {
                    setMessages(prev => prev.filter(m => m.id === payload.old.id))
                }
            })
            .subscribe((status) => {
                console.log(`Realtime subscription status for ticket ${ticketId}:`, status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [ticketId])

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/admin/support-tickets/${ticketId}/messages`)
            const result = await response.json()

            if (!response.ok) {
                console.error('Error fetching messages:', result.error)
                return
            }

            setMessages(result.messages || [])
        } catch (error) {
            console.error('Exception during fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim()) return

        setSending(true)
        try {
            const response = await fetch(`/api/admin/support-tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: newMessage }),
            })

            const result = await response.json()

            if (!response.ok) {
                console.error('Error sending message:', result.error)
                return
            }

            // We add it manually for instant feedback (Optimistic)
            // The realtime listener above will ignore it because the ID will match
            setMessages(prev => {
                const exists = prev.some(m => m.id === result.message.id)
                if (exists) return prev
                return [...prev, result.message]
            })
            setNewMessage('')
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSending(false)
        }
    }


    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading messages...</div>
    }

    return (
        <Card className="h-[700px] flex flex-col border-emerald-100/20 bg-zinc-950/50 backdrop-blur-sm">
            <CardHeader className="border-b border-white/5">
                <CardTitle className="text-emerald-500">Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${message.sender_type === 'admin'
                                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20'
                                        : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-white/5'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.message}</p>
                                    <div className="flex items-center justify-between gap-4 mt-1 opacity-50">
                                        <p className="text-[10px]">
                                            {format(new Date(message.created_at), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="space-y-2">
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                sendMessage()
                            }
                        }}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        disabled={sending}
                        className="min-h-[80px] resize-none"
                        rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={sending}
                            title="Attach file"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={sendMessage}
                            disabled={sending || !newMessage.trim()}
                            size="icon"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
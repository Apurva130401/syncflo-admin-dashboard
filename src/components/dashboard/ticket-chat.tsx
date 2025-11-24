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
                event: 'INSERT',
                schema: 'public',
                table: 'ticket_messages',
                filter: `ticket_id=eq.${ticketId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message])
            })
            .subscribe()

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

            setMessages(prev => [...prev, result.message])
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
        <Card className="h-[700px] flex flex-col">
            <CardHeader>
                <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
                <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender_type === 'admin'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm">{message.message}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                                    </p>
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
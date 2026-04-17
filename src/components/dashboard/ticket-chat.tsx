'use client'

import { useEffect, useState, useRef } from 'react'
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
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

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
        <Card className="h-full flex flex-col border-emerald-500/10 bg-white shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3 px-4 sm:py-4 sm:px-6 bg-slate-50/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-emerald-400 text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Support Chat
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative bg-slate-50/30">
                <ScrollArea className="flex-1 w-full h-[300px] min-h-0">
                    <div className="p-4 sm:p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 gap-2">
                                <Send className="w-8 h-8 opacity-20" />
                                <p className="text-sm">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl transition-all duration-200 ${message.sender_type === 'admin'
                                            ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-200'
                                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                                            {message.message}
                                        </p>
                                        <div className="flex items-center justify-end gap-2 mt-1.5 opacity-40">
                                            <p className="text-[9px] sm:text-[10px] font-medium">
                                                {format(new Date(message.created_at), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
                
                <div className="mt-auto pt-2 sm:pt-4 border-t border-slate-100 bg-slate-50/50 px-2 sm:px-0">
                    <div className="relative group p-1 sm:p-2">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    sendMessage()
                                }
                            }}
                            placeholder="Type your message..."
                            disabled={sending}
                            className="min-h-[60px] sm:min-h-[80px] w-full resize-none bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 pr-24 rounded-xl text-sm sm:text-base py-3 px-4 shadow-sm"
                            rows={2}
                        />
                        <div className="absolute right-4 bottom-4 flex gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={sending}
                                title="Attach file"
                                className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                                <Paperclip className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                            </Button>
                            <Button
                                onClick={sendMessage}
                                disabled={sending || !newMessage.trim()}
                                size="icon"
                                className="h-8 w-8 sm:h-9 sm:w-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                            >
                                <Send className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 ml-1 hidden sm:block">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
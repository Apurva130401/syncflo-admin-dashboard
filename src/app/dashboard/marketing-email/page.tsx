'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
    Megaphone,
    Mail,
    Send,
    Users,
    Eye,
    Code,
    Sparkles,
    CheckSquare,
    Square,
    Search,
    UserPlus,
    Copy,
    Check,
    AlertCircle,
    Info,
    RefreshCw,
    Loader2
} from 'lucide-react'

interface UserProfile {
    id: string
    email: string
    first_name?: string
    last_name?: string
    role?: string
    created_at?: string
}

interface Recipient {
    email: string
    first_name?: string
    last_name?: string
    id?: string
    source?: 'database' | 'custom'
}

const DYNAMIC_VARIABLES = [
    { tag: '{{first_name}}', label: 'First Name', example: 'Apurva', description: "Recipient's first name (falls back to 'there')" },
    { tag: '{{last_name}}', label: 'Last Name', example: 'Sharma', description: "Recipient's last name" },
    { tag: '{{name}}', label: 'Full Name', example: 'Apurva Sharma', description: "Full name (falls back to 'Valued User')" },
    { tag: '{{email}}', label: 'Email', example: 'user@example.com', description: "Recipient's email address" },
    { tag: '{{date}}', label: 'Current Date', example: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), description: "Today's date" },
]

const DEFAULT_TEMPLATES = [
    {
        name: 'Product Update Announcement',
        subject: '🚀 Exciting updates from SyncFlo AI!',
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 24px; color: #333333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 32px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .badge { display: inline-block; background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
    .content { padding: 36px 32px; font-size: 16px; line-height: 1.6; color: #334155; }
    .content h2 { color: #0f172a; margin-top: 0; font-size: 20px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin-top: 24px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">New Announcement</div>
      <h1>SyncFlo AI</h1>
    </div>
    <div class="content">
      <h2>Hello {{first_name}},</h2>
      <p>We're thrilled to introduce powerful new capabilities inside your <strong>SyncFlo AI</strong> dashboard designed to streamline your business workflow.</p>
      <p>Here is what is brand new:</p>
      <ul>
        <li><strong>Unified Marketing Engine:</strong> Launch, send, and track automated email campaigns directly from your admin panel.</li>
        <li><strong>Enhanced Analytics:</strong> Measure customer engagement in real-time.</li>
        <li><strong>Smart Variables:</strong> Personalize every message for high open & conversion rates.</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://dashboard.syncflo.xyz" class="btn">Explore SyncFlo AI Now</a>
      </div>
      <p>If you have any questions or feedback, feel free to reply directly to this email.</p>
      <p style="margin-top: 32px;">Warm regards,<br><strong>The SyncFlo AI Team</strong></p>
    </div>
    <div class="footer">
      <p>Sent to {{email}} via SyncFlo AI Admin.</p>
      <p>&copy; {{date}} SyncFlo AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    },
    {
        name: 'Simple Personal Letter',
        subject: 'Quick question for {{first_name}} from SyncFlo AI',
        html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; padding: 20px; background-color: #ffffff; }
    .wrapper { max-width: 580px; margin: 0 auto; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <p>Hi {{first_name}},</p>
    <p>Hope you're having a great week!</p>
    <p>We wanted to personally check in and see how your experience with SyncFlo AI has been. Our team is constantly pushing updates to help you get the best performance out of the platform.</p>
    <p>Do you have 2 minutes to share your thoughts or request a feature?</p>
    <p><a href="https://dashboard.syncflo.xyz" class="btn">Go to Dashboard</a></p>
    <br>
    <p>Best,<br><strong>Apurva</strong><br>SyncFlo AI</p>
  </div>
</body>
</html>`
    }
]

export default function MarketingEmailPage() {
    const { toast } = useToast()

    // Email state
    const [subject, setSubject] = useState(DEFAULT_TEMPLATES[0].subject)
    const [htmlContent, setHtmlContent] = useState(DEFAULT_TEMPLATES[0].html)
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0)

    // Editor & Preview state
    const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
    const [useSampleDataInPreview, setUseSampleDataInPreview] = useState<boolean>(true)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [copiedVariable, setCopiedVariable] = useState<string | null>(null)

    // Recipients state
    const [databaseUsers, setDatabaseUsers] = useState<UserProfile[]>([])
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true)
    const [selectedRecipientEmails, setSelectedRecipientEmails] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [customRecipients, setCustomRecipients] = useState<Recipient[]>([])
    const [customEmailInput, setCustomEmailInput] = useState<string>('')
    const [customNameInput, setCustomNameInput] = useState<string>('')

    // Sending & Dialog state
    const [activeTab, setActiveTab] = useState<string>('compose')
    const [isSendDialogOpen, setIsSendDialogOpen] = useState<boolean>(false)
    const [sending, setSending] = useState<boolean>(false)
    const [sendResults, setSendResults] = useState<{
        total: number
        sentCount: number
        failedCount: number
        results: Array<{ email: string; success: boolean; id?: string; error?: string }>
    } | null>(null)

    // Fetch registered database users
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (res.ok && Array.isArray(data.users)) {
                setDatabaseUsers(data.users)
                // Default select all valid emails
                const validEmails = data.users.filter((u: UserProfile) => u.email).map((u: UserProfile) => u.email)
                setSelectedRecipientEmails(new Set(validEmails))
            } else {
                toast({
                    title: 'Error loading users',
                    description: data.error || 'Failed to fetch platform users.',
                    variant: 'destructive'
                })
            }
        } catch (err) {
            console.error('Fetch users error:', err)
            toast({
                title: 'Network Error',
                description: 'Could not connect to user API.',
                variant: 'destructive'
            })
        } finally {
            setLoadingUsers(false)
        }
    }

    // Combine database users and custom added recipients
    const allRecipientsList: Recipient[] = [
        ...databaseUsers.map(u => ({
            id: u.id,
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
            source: 'database' as const
        })),
        ...customRecipients
    ]

    // Filter recipients by search query
    const filteredRecipients = allRecipientsList.filter(r => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase()
        return r.email.toLowerCase().includes(q) || fullName.includes(q)
    })

    // Select All / Deselect All Handlers
    const isAllSelected = filteredRecipients.length > 0 && filteredRecipients.every(r => selectedRecipientEmails.has(r.email))
    const isSomeSelected = filteredRecipients.some(r => selectedRecipientEmails.has(r.email)) && !isAllSelected

    const toggleSelectAll = () => {
        const nextSet = new Set(selectedRecipientEmails)
        if (isAllSelected) {
            filteredRecipients.forEach(r => nextSet.delete(r.email))
        } else {
            filteredRecipients.forEach(r => nextSet.add(r.email))
        }
        setSelectedRecipientEmails(nextSet)
    }

    const toggleRecipient = (email: string) => {
        const nextSet = new Set(selectedRecipientEmails)
        if (nextSet.has(email)) {
            nextSet.delete(email)
        } else {
            nextSet.add(email)
        }
        setSelectedRecipientEmails(nextSet)
    }

    const handleAddCustomRecipient = (e: React.FormEvent) => {
        e.preventDefault()
        if (!customEmailInput || !customEmailInput.includes('@')) {
            toast({
                title: 'Invalid Email',
                description: 'Please enter a valid email address.',
                variant: 'destructive'
            })
            return
        }

        const trimmedEmail = customEmailInput.trim().toLowerCase()
        if (allRecipientsList.some(r => r.email.toLowerCase() === trimmedEmail)) {
            toast({
                title: 'Already in list',
                description: 'This email is already in your recipient list.',
                variant: 'destructive'
            })
            return
        }

        const nameParts = customNameInput.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const newRecipient: Recipient = {
            email: trimmedEmail,
            first_name: firstName,
            last_name: lastName,
            source: 'custom'
        }

        setCustomRecipients(prev => [...prev, newRecipient])
        setSelectedRecipientEmails(prev => new Set(prev).add(trimmedEmail))
        setCustomEmailInput('')
        setCustomNameInput('')

        toast({
            title: 'Recipient Added',
            description: `Added ${trimmedEmail} to list.`,
        })
    }

    const removeCustomRecipient = (email: string) => {
        setCustomRecipients(prev => prev.filter(r => r.email !== email))
        setSelectedRecipientEmails(prev => {
            const next = new Set(prev)
            next.delete(email)
            return next
        })
    }

    // Insert dynamic variable at cursor in HTML editor
    const insertVariableIntoHtml = (tag: string) => {
        if (!textareaRef.current) {
            setHtmlContent(prev => prev + ' ' + tag)
            return
        }

        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd
        const text = htmlContent
        const newText = text.substring(0, start) + tag + text.substring(end)
        setHtmlContent(newText)

        // Reset cursor position
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(start + tag.length, start + tag.length)
            }
        }, 50)
    }

    const copyVariableToClipboard = (tag: string) => {
        navigator.clipboard.writeText(tag)
        setCopiedVariable(tag)
        setTimeout(() => setCopiedVariable(null), 2000)
    }

    // Compute live HTML preview string
    const getRenderedPreviewHtml = () => {
        if (!useSampleDataInPreview) return htmlContent

        const sampleRecipient: Recipient = {
            email: 'alex.smith@example.com',
            first_name: 'Alex',
            last_name: 'Smith'
        }

        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

        return htmlContent
            .replace(/\{\{\s*first_name\s*\}\}/gi, sampleRecipient.first_name!)
            .replace(/\{\{\s*last_name\s*\}\}/gi, sampleRecipient.last_name!)
            .replace(/\{\{\s*name\s*\}\}/gi, `${sampleRecipient.first_name} ${sampleRecipient.last_name}`)
            .replace(/\{\{\s*email\s*\}\}/gi, sampleRecipient.email)
            .replace(/\{\{\s*date\s*\}\}/gi, today)
    }

    const getRenderedPreviewSubject = () => {
        if (!useSampleDataInPreview) return subject

        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        return subject
            .replace(/\{\{\s*first_name\s*\}\}/gi, 'Alex')
            .replace(/\{\{\s*last_name\s*\}\}/gi, 'Smith')
            .replace(/\{\{\s*name\s*\}\}/gi, 'Alex Smith')
            .replace(/\{\{\s*email\s*\}\}/gi, 'alex.smith@example.com')
            .replace(/\{\{\s*date\s*\}\}/gi, today)
    }

    // Get selected recipients list for dispatch
    const getSelectedRecipients = (): Recipient[] => {
        return allRecipientsList.filter(r => selectedRecipientEmails.has(r.email))
    }

    // Execute email dispatch
    const handleSendMarketingEmail = async () => {
        const recipientsToSend = getSelectedRecipients()

        if (recipientsToSend.length === 0) {
            toast({
                title: 'No Recipients Selected',
                description: 'Please select at least one recipient from the Recipients tab.',
                variant: 'destructive'
            })
            return
        }

        if (!subject.trim()) {
            toast({
                title: 'Missing Subject Line',
                description: 'Please provide a subject line for your email.',
                variant: 'destructive'
            })
            return
        }

        if (!htmlContent.trim()) {
            toast({
                title: 'Empty HTML Body',
                description: 'Please add HTML content to your email.',
                variant: 'destructive'
            })
            return
        }

        setSending(true)
        setSendResults(null)

        try {
            const response = await fetch('/api/admin/marketing-email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    html: htmlContent,
                    recipients: recipientsToSend
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to dispatch marketing emails.')
            }

            setSendResults(data)
            toast({
                title: 'Campaign Completed',
                description: `Successfully sent ${data.sentCount} of ${data.total} emails.`,
            })
        } catch (err: unknown) {
            console.error('Dispatch error:', err)
            toast({
                title: 'Sending Failed',
                description: err instanceof Error ? err.message : 'An error occurred while sending.',
                variant: 'destructive'
            })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 backdrop-blur-md px-3 py-1">
                            <Megaphone className="w-3.5 h-3.5 mr-1 text-blue-400" /> Marketing Engine
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-md px-3 py-1">
                            Resend Active
                        </Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Marketing Email Campaigns</h1>
                    <p className="text-slate-300 text-sm max-w-xl">
                        Compose rich HTML emails with dynamic personalization and dispatch directly from{' '}
                        <code className="text-blue-300 font-mono bg-white/10 px-1.5 py-0.5 rounded">SyncFlo AI &lt;marketing@updates.syncflo.xyz&gt;</code>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-slate-400">Selected Recipients</div>
                        <div className="text-xl font-bold text-white">
                            {selectedRecipientEmails.size} / {allRecipientsList.length}
                        </div>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => setIsSendDialogOpen(true)}
                        disabled={selectedRecipientEmails.size === 0}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 rounded-xl px-6 py-6"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Campaign ({selectedRecipientEmails.size})
                    </Button>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="compose" className="rounded-lg text-sm font-medium px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Code className="w-4 h-4 mr-2 text-indigo-600" /> Compose & Preview
                        </TabsTrigger>
                        <TabsTrigger value="recipients" className="rounded-lg text-sm font-medium px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Users className="w-4 h-4 mr-2 text-blue-600" /> Recipients ({selectedRecipientEmails.size})
                        </TabsTrigger>
                        <TabsTrigger value="variables" className="rounded-lg text-sm font-medium px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Sparkles className="w-4 h-4 mr-2 text-amber-500" /> Dynamic Variables
                        </TabsTrigger>
                    </TabsList>

                    {/* Preset Template Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presets:</span>
                        <div className="flex gap-2">
                            {DEFAULT_TEMPLATES.map((tmpl, idx) => (
                                <Button
                                    key={idx}
                                    variant={selectedTemplateIndex === idx ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setSelectedTemplateIndex(idx)
                                        setSubject(tmpl.subject)
                                        setHtmlContent(tmpl.html)
                                        toast({
                                            title: 'Template Loaded',
                                            description: `Loaded preset "${tmpl.name}"`
                                        })
                                    }}
                                    className="rounded-lg text-xs"
                                >
                                    {tmpl.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TAB 1: COMPOSE & PREVIEW */}
                <TabsContent value="compose" className="mt-6 space-y-6">
                    {/* Subject Line & Sender Bar */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                                <Mail className="w-5 h-5 text-blue-600" /> Email Configuration
                            </CardTitle>
                            <CardDescription>
                                Set email subject line and review outgoing sender address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">From Sender</label>
                                    <Input
                                        value="SyncFlo AI <marketing@updates.syncflo.xyz>"
                                        disabled
                                        className="bg-slate-50 text-slate-700 font-mono text-xs font-medium rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject Line</label>
                                    <Input
                                        placeholder="Enter email subject line..."
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="font-medium text-slate-900 rounded-xl border-slate-300 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Quick Variable Insert Bar */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Insert Variable:
                                </span>
                                {DYNAMIC_VARIABLES.map((v) => (
                                    <button
                                        key={v.tag}
                                        type="button"
                                        onClick={() => insertVariableIntoHtml(v.tag)}
                                        className="inline-flex items-center gap-1 text-xs font-mono bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg transition-all"
                                        title={`Insert ${v.tag} into HTML`}
                                    >
                                        + {v.tag}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Split View: HTML Code vs Rendered Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Editor Panel */}
                        <Card className="border-slate-200 shadow-sm rounded-2xl flex flex-col h-[650px]">
                            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900">
                                        <Code className="w-4 h-4 text-indigo-600" /> HTML Editor
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Paste or edit your custom HTML email markup.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono bg-slate-50">
                                    {htmlContent.length} chars
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 relative">
                                <Textarea
                                    ref={textareaRef}
                                    value={htmlContent}
                                    onChange={(e) => setHtmlContent(e.target.value)}
                                    placeholder="<html><body><h1>Your email content...</h1></body></html>"
                                    className="w-full h-full p-4 font-mono text-xs leading-relaxed text-slate-800 bg-slate-950/5 border-0 focus-visible:ring-0 resize-none rounded-b-2xl"
                                />
                            </CardContent>
                        </Card>

                        {/* Live Preview Panel */}
                        <Card className="border-slate-200 shadow-sm rounded-2xl flex flex-col h-[650px] overflow-hidden">
                            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
                                <div>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900">
                                        <Eye className="w-4 h-4 text-emerald-600" /> Live HTML Preview
                                    </CardTitle>
                                    <CardDescription className="text-xs truncate max-w-xs">
                                        Subject: <span className="font-semibold text-slate-700">{getRenderedPreviewSubject() || '(No Subject)'}</span>
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer select-none">
                                        <Checkbox
                                            checked={useSampleDataInPreview}
                                            onCheckedChange={(checked) => setUseSampleDataInPreview(!!checked)}
                                        />
                                        <span>Apply Sample Data</span>
                                    </label>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 bg-slate-100">
                                <iframe
                                    srcDoc={getRenderedPreviewHtml()}
                                    title="Email Live Preview"
                                    className="w-full h-full border-0 bg-white"
                                    sandbox="allow-popups allow-same-origin"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: RECIPIENTS SELECTION */}
                <TabsContent value="recipients" className="mt-6 space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                                        <Users className="w-5 h-5 text-blue-600" /> Select Email Recipients
                                    </CardTitle>
                                    <CardDescription>
                                        Choose registered platform users or add custom email addresses to receive this campaign.
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant={isAllSelected ? 'default' : 'outline'}
                                        onClick={toggleSelectAll}
                                        className="rounded-xl"
                                        size="sm"
                                    >
                                        {isAllSelected ? (
                                            <>
                                                <CheckSquare className="w-4 h-4 mr-2" /> Deselect All ({filteredRecipients.length})
                                            </>
                                        ) : (
                                            <>
                                                <Square className="w-4 h-4 mr-2" /> Select All ({filteredRecipients.length})
                                            </>
                                        )}
                                    </Button>

                                    <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={loadingUsers} className="rounded-xl">
                                        <RefreshCw className={`w-4 h-4 mr-1 ${loadingUsers ? 'animate-spin' : ''}`} /> Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Search & Custom Add Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                {/* Search Filter */}
                                <div className="md:col-span-6 relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 rounded-xl border-slate-300"
                                    />
                                </div>

                                {/* Quick Add Custom Email Form */}
                                <form onSubmit={handleAddCustomRecipient} className="md:col-span-6 flex gap-2">
                                    <Input
                                        placeholder="Custom Email (e.g. user@domain.com)"
                                        value={customEmailInput}
                                        onChange={(e) => setCustomEmailInput(e.target.value)}
                                        className="rounded-xl border-slate-300"
                                    />
                                    <Input
                                        placeholder="Name (Optional)"
                                        value={customNameInput}
                                        onChange={(e) => setCustomNameInput(e.target.value)}
                                        className="rounded-xl border-slate-300 hidden sm:block w-36"
                                    />
                                    <Button type="submit" variant="secondary" className="rounded-xl shrink-0">
                                        <UserPlus className="w-4 h-4 mr-1" /> Add
                                    </Button>
                                </form>
                            </div>

                            {/* Recipients Table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-12 text-center">
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={toggleSelectAll}
                                                    aria-label="Select all"
                                                />
                                            </TableHead>
                                            <TableHead className="font-semibold">Recipient / Email</TableHead>
                                            <TableHead className="font-semibold">Name</TableHead>
                                            <TableHead className="font-semibold">Source</TableHead>
                                            <TableHead className="w-24 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingUsers ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                                                    Loading platform users...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredRecipients.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                                    No recipients found matching &quot;{searchQuery}&quot;.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredRecipients.map((recipient) => {
                                                const isSelected = selectedRecipientEmails.has(recipient.email)
                                                return (
                                                    <TableRow
                                                        key={recipient.email}
                                                        className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                                                    >
                                                        <TableCell className="text-center">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleRecipient(recipient.email)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium text-slate-900">
                                                            {recipient.email}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {[recipient.first_name, recipient.last_name].filter(Boolean).join(' ') || (
                                                                <span className="text-slate-400 italic">No name provided</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {recipient.source === 'custom' ? (
                                                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                    Custom Added
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                    Registered User
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {recipient.source === 'custom' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeCustomRecipient(recipient.email)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                                                >
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: DYNAMIC VARIABLES GUIDE */}
                <TabsContent value="variables" className="mt-6 space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                                <Sparkles className="w-5 h-5 text-amber-500" /> Usable Dynamic Variables
                            </CardTitle>
                            <CardDescription>
                                You can place these dynamic placeholders inside your <strong>Subject Line</strong> or <strong>HTML Body</strong>.
                                When sending emails, SyncFlo AI automatically replaces each tag with recipient-specific data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DYNAMIC_VARIABLES.map((item) => (
                                    <div
                                        key={item.tag}
                                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <code className="text-sm font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                                                {item.tag}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyVariableToClipboard(item.tag)}
                                                className="text-xs h-8 text-slate-600 hover:text-slate-900"
                                            >
                                                {copiedVariable === item.tag ? (
                                                    <span className="flex items-center text-emerald-600 font-semibold">
                                                        <Check className="w-3.5 h-3.5 mr-1" /> Copied!
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Tag
                                                    </span>
                                                )}
                                            </Button>
                                        </div>

                                        <p className="text-xs text-slate-600">{item.description}</p>
                                        <div className="text-xs text-slate-500 font-mono bg-white p-2 rounded-lg border border-slate-200">
                                            Sample Output: <span className="font-semibold text-slate-800">{item.example}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* HTML Example Showcase */}
                            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 space-y-3">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                                    <span>HTML Example Code</span>
                                    <span>Template snippet</span>
                                </div>
                                <pre className="font-mono text-xs text-emerald-400 overflow-x-auto p-3 bg-slate-950 rounded-xl leading-relaxed">
                                    {`<h2>Hello {{first_name}},</h2>
<p>Your registered email address is <strong>{{email}}</strong>.</p>
<p>Special offer valid through {{date}}.</p>`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* CONFIRMATION & SENDING DIALOG */}
            <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                <DialogContent className="max-w-xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
                            <Send className="w-5 h-5 text-blue-600" /> Send Marketing Campaign
                        </DialogTitle>
                        <DialogDescription>
                            Confirm email parameters before dispatching to Resend.
                        </DialogDescription>
                    </DialogHeader>

                    {!sendResults ? (
                        <div className="space-y-4 py-2">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm border border-slate-200">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500 font-medium">From Address:</span>
                                    <span className="font-mono text-slate-800 text-xs font-semibold">SyncFlo AI &lt;marketing@updates.syncflo.xyz&gt;</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-500 font-medium">Subject Line:</span>
                                    <span className="font-semibold text-slate-900 truncate max-w-xs">{subject}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Target Recipients:</span>
                                    <Badge className="bg-blue-600 text-white font-bold px-2.5">
                                        {selectedRecipientEmails.size} Recipients Selected
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    Emails will be individually personalized using dynamic tags before dispatch. Make sure your template looks good in the Live Preview tab.
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button variant="outline" onClick={() => setIsSendDialogOpen(false)} disabled={sending} className="rounded-xl">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSendMarketingEmail}
                                    disabled={sending}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-6"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Dispatching Emails...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" /> Confirm & Send Now
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        /* RESULTS DISPLAY */
                        <div className="space-y-4 py-2">
                            <div className={`p-4 rounded-xl text-center space-y-1 ${sendResults.failedCount === 0 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
                                <div className="text-3xl font-extrabold">{sendResults.sentCount} / {sendResults.total}</div>
                                <div className="text-sm font-semibold">
                                    {sendResults.failedCount === 0 ? 'All emails sent successfully!' : `${sendResults.failedCount} email(s) encountered errors.`}
                                </div>
                            </div>

                            {/* Detailed breakdown list */}
                            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y text-xs">
                                {sendResults.results.map((r, i) => (
                                    <div key={i} className="p-3 flex items-center justify-between">
                                        <span className="font-mono text-slate-800">{r.email}</span>
                                        {r.success ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                                                Sent (ID: {r.id?.substring(0, 8)}...)
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 border-red-300" title={r.error}>
                                                Failed: {r.error || 'Error'}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <DialogFooter>
                                <Button
                                    onClick={() => {
                                        setIsSendDialogOpen(false)
                                        setSendResults(null)
                                    }}
                                    className="rounded-xl w-full"
                                >
                                    Close Report
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

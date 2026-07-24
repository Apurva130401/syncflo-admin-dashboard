import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

interface Recipient {
    email: string
    first_name?: string
    last_name?: string
}

function replaceVariables(text: string, recipient: Recipient): string {
    if (!text) return ''

    const firstName = (recipient.first_name || '').trim()
    const lastName = (recipient.last_name || '').trim()
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Valued User'
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const unsubscribeUrl = `https://updates.syncflo.xyz/unsubscribe?email=${encodeURIComponent(recipient.email)}`

    return text
        .replace(/\{\{\s*first_name\s*\}\}/gi, firstName || 'there')
        .replace(/\{\{\s*last_name\s*\}\}/gi, lastName)
        .replace(/\{\{\s*name\s*\}\}/gi, fullName)
        .replace(/\{\{\s*email\s*\}\}/gi, recipient.email)
        .replace(/\{\{\s*date\s*\}\}/gi, today)
        .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubscribeUrl)
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'RESEND_API_KEY is missing in server environment variables.' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { subject, html, recipients } = body as {
            subject: string
            html: string
            recipients: Recipient[]
        }

        if (!subject || typeof subject !== 'string') {
            return NextResponse.json({ error: 'Email subject line is required.' }, { status: 400 })
        }

        if (!html || typeof html !== 'string') {
            return NextResponse.json({ error: 'HTML email body is required.' }, { status: 400 })
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'At least one recipient must be selected.' }, { status: 400 })
        }

        const resend = new Resend(apiKey)
        const fromAddress = 'SyncFlo AI <marketing@updates.syncflo.xyz>'

        const results: Array<{ email: string; success: boolean; id?: string; error?: string }> = []
        let sentCount = 0
        let failedCount = 0

        // Send emails sequentially or in parallel batches
        for (const recipient of recipients) {
            if (!recipient.email) continue

            const personalizedSubject = replaceVariables(subject, recipient)
            const personalizedHtml = replaceVariables(html, recipient)

            try {
                const { data, error } = await resend.emails.send({
                    from: fromAddress,
                    to: recipient.email,
                    subject: personalizedSubject,
                    html: personalizedHtml
                })

                if (error) {
                    failedCount++
                    results.push({
                        email: recipient.email,
                        success: false,
                        error: error.message || 'Resend delivery failed'
                    })
                } else {
                    sentCount++
                    results.push({
                        email: recipient.email,
                        success: true,
                        id: data?.id
                    })
                }
            } catch (err: unknown) {
                failedCount++
                results.push({
                    email: recipient.email,
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown dispatch error'
                })
            }
        }

        return NextResponse.json({
            success: true,
            total: recipients.length,
            sentCount,
            failedCount,
            results
        })
    } catch (error: unknown) {
        console.error('Marketing Email Sending Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}

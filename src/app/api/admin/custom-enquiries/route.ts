import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getCrmConfig() {
    const crmUrl = process.env.SYNCFLO_CRM_URL
    const crmApiKey = process.env.SYNCFLO_CRM_API_KEY

    if (!crmUrl || !crmApiKey) {
        throw new Error('Twenty CRM configuration is missing')
    }

    return {
        baseUrl: crmUrl.replace(/\/$/, ''),
        apiKey: crmApiKey,
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function normalizeEnterpriseInquiries(payload: unknown) {
    if (Array.isArray(payload)) return payload
    if (!isRecord(payload)) return []

    const data = payload.data
    if (Array.isArray(data)) return data
    if (isRecord(data) && Array.isArray(data.enterpriseInquiries)) return data.enterpriseInquiries
    if (Array.isArray(payload.enterpriseInquiries)) return payload.enterpriseInquiries

    return []
}

export async function GET() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { baseUrl, apiKey } = getCrmConfig()
        const response = await fetch(`${baseUrl}/rest/enterpriseInquiries`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            cache: 'no-store',
        })

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
            return NextResponse.json(
                { error: isRecord(payload) && typeof payload.message === 'string' ? payload.message : 'Failed to fetch custom enquiries' },
                { status: response.status }
            )
        }

        return NextResponse.json({ inquiries: normalizeEnterpriseInquiries(payload) })
    } catch (error) {
        console.error('Error fetching custom enquiries:', error)
        const message = error instanceof Error && error.message === 'Twenty CRM configuration is missing'
            ? 'Twenty CRM environment variables are missing. Set SYNCFLO_CRM_URL and SYNCFLO_CRM_API_KEY.'
            : 'Failed to fetch custom enquiries'

        return NextResponse.json({ error: message }, { status: 500 })
    }
}

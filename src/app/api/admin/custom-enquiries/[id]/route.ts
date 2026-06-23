import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_STATUSES = new Set(['New', 'In Progress', 'Contacted', 'Closed'])

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

function normalizeUpdatedInquiry(payload: unknown) {
    if (!isRecord(payload)) return payload

    const data = payload.data
    if (isRecord(data)) {
        return data.updateEnterpriseInquiry || data.enterpriseInquiry || data
    }

    return payload.enterpriseInquiry || data || payload
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const body = await request.json()
        const status = typeof body.status === 'string' && ALLOWED_STATUSES.has(body.status)
            ? body.status
            : 'New'
        const internalNotes = typeof body.internalNotes === 'string' ? body.internalNotes : ''

        const { baseUrl, apiKey } = getCrmConfig()
        const response = await fetch(`${baseUrl}/rest/enterpriseInquiries/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, internalNotes }),
        })

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
            return NextResponse.json(
                { error: isRecord(payload) && typeof payload.message === 'string' ? payload.message : 'Failed to update custom enquiry' },
                { status: response.status }
            )
        }

        return NextResponse.json({ inquiry: normalizeUpdatedInquiry(payload) })
    } catch (error) {
        console.error('Error updating custom enquiry:', error)
        const message = error instanceof Error && error.message === 'Twenty CRM configuration is missing'
            ? 'Twenty CRM environment variables are missing. Set SYNCFLO_CRM_URL and SYNCFLO_CRM_API_KEY.'
            : 'Failed to update custom enquiry'

        return NextResponse.json({ error: message }, { status: 500 })
    }
}

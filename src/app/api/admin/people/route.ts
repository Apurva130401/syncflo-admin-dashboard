import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getTwentyCrmConfig() {
    const crmUrl = process.env.TWENTY_BASE_URL || process.env.SYNCFLO_CRM_URL
    const crmApiKey = process.env.TWENTY_API_KEY || process.env.SYNCFLO_CRM_API_KEY

    if (!crmApiKey) {
        throw new Error('Twenty CRM API Key is missing. Please set TWENTY_API_KEY or SYNCFLO_CRM_API_KEY in .env.local.')
    }

    const urls = []
    if (process.env.TWENTY_BASE_URL) urls.push(process.env.TWENTY_BASE_URL.replace(/\/$/, ''))
    if (process.env.SYNCFLO_CRM_URL) urls.push(process.env.SYNCFLO_CRM_URL.replace(/\/$/, ''))
    if (urls.length === 0) urls.push('https://crm.syncflo.xyz')

    return {
        urls,
        apiKey: crmApiKey,
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export function parseLinkValue(val: any): { url: string; label: string } | null {
    if (!val) return null
    let obj = val

    if (typeof val === 'string') {
        const trimmed = val.trim()
        if (trimmed.startsWith('{')) {
            try {
                obj = JSON.parse(trimmed)
            } catch {
                obj = null
            }
        } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('.')) {
            const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
            let label = trimmed.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
            return { url, label }
        }
    }

    if (isRecord(obj)) {
        let url = (obj.primaryLinkUrl || obj.url || obj.link || '') as string
        let label = (obj.primaryLinkLabel || obj.label || '') as string

        if (url) {
            const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
            if (!label) {
                label = formattedUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
            }
            return { url: formattedUrl, label }
        }
    }

    return null
}

function extractEmail(item: any): string {
    if (!item) return ''
    if (typeof item.email === 'string') return item.email
    if (typeof item.emails === 'string') return item.emails
    if (isRecord(item.emails)) {
        return (item.emails.primaryEmail || item.emails.email || item.emails.address || '') as string
    }
    if (Array.isArray(item.emails) && item.emails.length > 0) {
        const first = item.emails[0]
        return typeof first === 'string' ? first : (first.primaryEmail || first.email || '')
    }
    return ''
}

function extractPhone(item: any): string {
    if (!item) return ''
    if (typeof item.phone === 'string') return item.phone
    if (typeof item.phones === 'string') return item.phones
    if (isRecord(item.phones)) {
        return (item.phones.primaryPhone || item.phones.phone || item.phones.number || '') as string
    }
    if (Array.isArray(item.phones) && item.phones.length > 0) {
        const first = item.phones[0]
        return typeof first === 'string' ? first : (first.primaryPhone || first.phone || '')
    }
    return ''
}

function extractName(item: any): string {
    if (!item) return ''
    if (typeof item.name === 'string') return item.name
    if (isRecord(item.name)) {
        const first = item.name.firstName || item.name.first || ''
        const last = item.name.lastName || item.name.last || ''
        const full = `${first} ${last}`.trim()
        if (full) return full
    }
    const first = item.firstName || ''
    const last = item.lastName || ''
    if (first || last) return `${first} ${last}`.trim()
    return item.id || 'Unnamed Person'
}

function cleanDomainToCompanyName(domain: string): string {
    if (!domain) return ''
    const host = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    const root = host.split('.')[0]
    if (!root || ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'protonmail'].includes(root)) {
        return ''
    }
    return root
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}

function extractCompany(item: any): string {
    if (!item) return ''

    if (typeof item.company === 'string' && item.company.trim()) return item.company.trim()
    if (isRecord(item.company)) {
        const name = (item.company.name || item.company.domainName || '') as string
        if (name && name.trim()) return name.trim()
    }
    if (typeof item.companyName === 'string' && item.companyName.trim()) return item.companyName.trim()
    if (typeof item.workCompany === 'string' && item.workCompany.trim()) return item.workCompany.trim()

    const website = item.companyWebsite || item.website || item.domain
    const parsedLink = parseLinkValue(website)
    if (parsedLink && parsedLink.url) {
        const companyName = cleanDomainToCompanyName(parsedLink.url)
        if (companyName) return companyName
    }

    const email = extractEmail(item)
    if (email && email.includes('@')) {
        const domain = email.split('@')[1]
        const companyName = cleanDomainToCompanyName(domain)
        if (companyName) return companyName
    }

    return ''
}

function normalizePeople(rawPeople: any[]): { people: any[]; columns: string[] } {
    const allColumnKeys = new Set<string>()

    const coreColumns = ['name', 'email', 'phone', 'company', 'jobTitle', 'city', 'createdAt', 'updatedAt']
    coreColumns.forEach(c => allColumnKeys.add(c))

    const normalized = rawPeople.map((item: any, idx: number) => {
        const id = item.id || `person-${idx}`
        const name = extractName(item)
        const email = extractEmail(item)
        const phone = extractPhone(item)
        const company = extractCompany(item)
        const jobTitle = item.jobTitle || item.position || item.title || ''
        const city = item.city || (isRecord(item.address) ? item.address.city : '') || item.location || ''
        const avatarUrl = item.avatarUrl || item.picture || ''
        const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
        const updatedAt = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''

        const personRecord: Record<string, any> = {
            id,
            name,
            email,
            phone,
            company,
            jobTitle,
            city,
            avatarUrl,
            createdAt,
            updatedAt,
        }

        Object.keys(item).forEach(key => {
            if (['id', 'name', 'emails', 'phones', 'email', 'phone', 'company', 'jobTitle', 'position', 'title', 'city', 'avatarUrl', 'picture', 'createdAt', 'updatedAt', 'address', 'companyName', '__typename'].includes(key)) {
                return
            }

            let val = item[key]
            if (val === null || val === undefined) {
                personRecord[key] = ''
            } else {
                const parsedLink = parseLinkValue(val)
                if (parsedLink) {
                    personRecord[key] = {
                        __isLink: true,
                        url: parsedLink.url,
                        label: parsedLink.label
                    }
                } else if (typeof val === 'object') {
                    personRecord[key] = JSON.stringify(val)
                } else {
                    personRecord[key] = String(val)
                }
            }

            allColumnKeys.add(key)
        })

        return personRecord
    })

    return {
        people: normalized,
        columns: Array.from(allColumnKeys),
    }
}

async function fetchAllPeopleFromTwenty(baseUrl: string, apiKey: string): Promise<any[]> {
    let allRecords: any[] = []

    // 1. REST API with max limit & pagination
    try {
        let cursor: string | null = null
        let hasMore = true
        let attempts = 0

        while (hasMore && attempts < 10) {
            attempts++
            const url: string = cursor
                ? `${baseUrl}/rest/people?limit=1000&starting_after=${cursor}`
                : `${baseUrl}/rest/people?limit=1000`

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            })

            if (!res.ok) break

            const payload: any = await res.json().catch(() => null)
            if (!payload) break

            let items: any[] = []
            if (Array.isArray(payload)) items = payload
            else if (Array.isArray(payload.data)) items = payload.data
            else if (isRecord(payload.data) && Array.isArray(payload.data.people)) items = payload.data.people
            else if (Array.isArray(payload.people)) items = payload.people

            if (items.length === 0) break

            allRecords = allRecords.concat(items)

            const pageInfo = payload?.pageInfo || payload?.data?.pageInfo
            if (pageInfo && pageInfo.hasNextPage && pageInfo.endCursor) {
                cursor = pageInfo.endCursor
            } else if (items.length >= 60) {
                const lastId = items[items.length - 1]?.id
                if (lastId && lastId !== cursor) {
                    cursor = lastId
                } else {
                    hasMore = false
                }
            } else {
                hasMore = false
            }
        }

        if (allRecords.length > 0) return allRecords
    } catch (e) {
        console.error('REST fetch error:', e)
    }

    // 2. GraphQL API Fallback with pagination
    try {
        let afterCursor: string | null = null
        let hasMoreGql = true
        let gqlAttempts = 0

        while (hasMoreGql && gqlAttempts < 10) {
            gqlAttempts++
            const response: Response = await fetch(`${baseUrl}/graphql`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        query GetPeople($first: Int!, $after: String) {
                            people(first: $first, after: $after) {
                                edges {
                                    node {
                                        id
                                        name { firstName lastName }
                                        emails { primaryEmail }
                                        phones { primaryPhone }
                                        jobTitle
                                        city
                                        company { name }
                                        companyWebsite
                                        linkedinLink
                                        createdAt
                                        updatedAt
                                    }
                                }
                                pageInfo {
                                    hasNextPage
                                    endCursor
                                }
                            }
                        }
                    `,
                    variables: {
                        first: 1000,
                        after: afterCursor,
                    }
                }),
                cache: 'no-store',
            })

            if (!response.ok) break

            const gqlPayloadData: any = await response.json().catch(() => null)
            const peopleResult: any = gqlPayloadData?.data?.people
            const edges: any[] = peopleResult?.edges
            if (!Array.isArray(edges) || edges.length === 0) break

            const nodes = edges.map((e: any) => e.node)
            allRecords = allRecords.concat(nodes)

            hasMoreGql = !!peopleResult?.pageInfo?.hasNextPage
            afterCursor = peopleResult?.pageInfo?.endCursor || null

            if (!afterCursor) break
        }
    } catch (e) {
        console.error('GraphQL fetch error:', e)
    }

    return allRecords
}

export async function GET() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { urls, apiKey } = getTwentyCrmConfig()

        let lastError: any = null
        let rawData: any[] = []

        for (const baseUrl of urls) {
            try {
                const fetched = await fetchAllPeopleFromTwenty(baseUrl, apiKey)
                if (fetched && fetched.length > 0) {
                    rawData = fetched
                    break
                }
            } catch (err) {
                lastError = err
            }
        }

        if (rawData.length === 0) {
            return NextResponse.json({
                people: [],
                columns: ['name', 'email', 'phone', 'company', 'jobTitle', 'city', 'createdAt', 'updatedAt'],
                warning: lastError ? `Could not connect to Twenty CRM host: ${lastError.message || lastError}` : 'No people found in Twenty CRM'
            })
        }

        const normalized = normalizePeople(rawData)
        return NextResponse.json(normalized)
    } catch (error: any) {
        console.error('Error fetching Twenty CRM people:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch people from Twenty CRM' },
            { status: 500 }
        )
    }
}

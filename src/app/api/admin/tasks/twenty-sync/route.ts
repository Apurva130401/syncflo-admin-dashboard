import { NextResponse } from 'next/server'

const TWENTY_GRAPHQL_QUERY = `
  query GetTasks {
    tasks(filter: {}, orderBy: { createdAt: DescNullsLast }) {
      edges {
        node {
          id
          title
          body
          status
          dueAt
          createdAt
          updatedAt
          assignee {
            id
            name {
              firstName
              lastName
            }
            emails {
              primaryEmail
            }
          }
          taskTargets {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`

function mapTwentyStatus(status: string): string {
    switch (status?.toUpperCase()) {
        case 'DONE': return 'Done'
        case 'IN_PROGRESS': return 'In Progress'
        case 'TODO': return 'Todo'
        default: return 'Todo'
    }
}

function mapTwentyPriority(): string {
    // Twenty CRM tasks don't have a native priority field by default,
    // so we default to Medium. Extend this if you add custom fields.
    return 'Medium'
}

export async function GET() {
    const apiKey = process.env.TWENTY_API_KEY
    const baseUrl = process.env.TWENTY_BASE_URL

    if (!apiKey || !baseUrl) {
        return NextResponse.json(
            { error: 'TWENTY_API_KEY or TWENTY_BASE_URL is missing in environment variables.' },
            { status: 500 }
        )
    }

    try {
        const response = await fetch(`${baseUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ query: TWENTY_GRAPHQL_QUERY }),
            // Bypass SSL for local Docker Twenty instance
            // @ts-ignore
            agent: baseUrl.startsWith('http://') ? undefined : undefined,
        })

        if (!response.ok) {
            const text = await response.text()
            console.error('Twenty CRM error:', text)
            return NextResponse.json(
                { error: `Twenty CRM responded with ${response.status}: ${text}` },
                { status: response.status }
            )
        }

        const json = await response.json()

        if (json.errors) {
            console.error('Twenty GraphQL errors:', json.errors)
            return NextResponse.json(
                { error: json.errors[0]?.message || 'GraphQL error from Twenty CRM' },
                { status: 400 }
            )
        }

        const edges = json?.data?.tasks?.edges || []

        const tasks = edges.map(({ node }: any) => {
            const assigneeName = node.assignee
                ? [node.assignee.name?.firstName, node.assignee.name?.lastName].filter(Boolean).join(' ')
                : null

            const assigneeEmail = node.assignee?.emails?.primaryEmail || null

            return {
                id: `twenty_${node.id}`,
                title: node.title || '(Untitled)',
                description: node.body || '',
                status: mapTwentyStatus(node.status),
                priority: mapTwentyPriority(),
                due_date: node.dueAt ? new Date(node.dueAt).toISOString().split('T')[0] : null,
                created_at: node.createdAt,
                source: 'twenty_crm',
                assigned_user: assigneeName || assigneeEmail
                    ? { email: assigneeEmail || '', first_name: node.assignee?.name?.firstName || '', last_name: node.assignee?.name?.lastName || '' }
                    : null,
            }
        })

        return NextResponse.json({ tasks, total: tasks.length })

    } catch (error: unknown) {
        console.error('Twenty CRM sync error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to connect to Twenty CRM' },
            { status: 500 }
        )
    }
}

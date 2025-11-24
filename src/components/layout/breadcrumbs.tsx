'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import React from 'react'

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  clients: 'Clients',
  messages: 'Messages',
  integrations: 'Integrations',
  billing: 'Billing',
  settings: 'Settings',
  support: 'Support',
  account: 'Account',
  branding: 'Branding',
  creatives: 'Creatives',
  'voice-transcripts': 'Voice Transcripts',
  'whatsapp-logs': 'WhatsApp Logs',
  whatsapp: 'WhatsApp',
  inbox: 'Inbox',
  'api-docs': 'API Docs',
  'ai-prompts': 'AI Prompts',
  'ad-creative': 'Ad Creative',
}

function toTitle(slug: string) {
  if (labelMap[slug]) return labelMap[slug]
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const path = (pathname ?? '').split('?')[0]
  const parts = path.split('/').filter(Boolean)

  // Build cumulative hrefs
  let acc = ''
  const crumbs = parts.map((seg) => {
    acc += `/${seg}`
    return { href: acc, label: toTitle(seg) }
  })

  if (crumbs.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <ol className="flex items-center gap-1">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={c.href} className="flex items-center">
              {i > 0 && (
                <ChevronRight className="mx-1 h-4 w-4 text-gray-400" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="text-gray-700">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="hover:text-gray-900 hover:underline underline-offset-4"
                >
                  {c.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
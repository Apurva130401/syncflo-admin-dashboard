'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, Mic, MessageSquare, Settings, BarChart3 } from 'lucide-react'

const links = [
  { name: "Create New Ad Creative", href: "/dashboard/ad-creative", icon: FileText },
  { name: "Start a New Voice Campaign", href: "/dashboard/voice/campaigns", icon: Mic },
  { name: "Send a WhatsApp Broadcast", href: "/dashboard/whatsapp/campaigns/broadcasts", icon: MessageSquare },
  { name: "View Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Manage Account Settings", href: "/dashboard/account", icon: Settings },
];

export function QuickLinks() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {links.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={link.href} passHref>
                <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center p-4 space-y-2">
                  <link.icon className="h-8 w-8 text-gray-600" />
                  <span className="text-center text-sm">{link.name}</span>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

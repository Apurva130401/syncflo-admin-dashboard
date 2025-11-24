'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, LifeBuoy, Users } from 'lucide-react'

const supportLinks = [
  { name: "Documentation", href: "/docs", icon: BookOpen },
  { name: "Contact Support", href: "/support", icon: LifeBuoy },
  { name: "Community Forums", href: "/community", icon: Users },
];

export function HelpAndSupport() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Help & Support</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {supportLinks.map((link, index) => (
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

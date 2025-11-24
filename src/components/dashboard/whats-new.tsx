'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

const updates = [
  {
    title: "New AI-Powered Ad Creative Generator",
    description: "Generate high-quality ad creatives in seconds with our new AI-powered tool. Simply provide a few details about your product or service, and our AI will do the rest.",
    date: "October 22, 2025",
    tag: "New Feature",
  },
  {
    title: "Voice Funnels are Here!",
    description: "Create interactive voice funnels to engage your customers and automate your sales process. Guide your customers through a series of questions and collect valuable information along the way.",
    date: "October 20, 2025",
    tag: "New Feature",
  },
  {
    title: "WhatsApp Integration Improvements",
    description: "We&apos;ve made several improvements to our WhatsApp integration, including support for more message types and better performance.",
    date: "October 18, 2025",
    tag: "Enhancement",
  },
];

export function WhatsNew() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>What&apos;s New</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {updates.map((update, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold">{update.title}</h3>
                  <Badge variant={update.tag === 'New Feature' ? 'default' : 'secondary'}>
                    {update.tag}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{update.description}</p>
                <p className="text-xs text-gray-500 mt-2">{update.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

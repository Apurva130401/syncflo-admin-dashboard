'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'

const utilizationData = [
  { name: "WhatsApp Messages", value: 77, limit: 500 },
  { name: "Voice Minutes", value: 60, limit: 1000 },
  { name: "AI Prompts", value: 45, limit: 1000 },
  { name: "Ad Creatives", value: 25, limit: 100 },
];

export function CostUtilization() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Cost & Utilization</CardTitle>
        <CardDescription>Your current spending and resource usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {utilizationData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-gray-500">
                  {item.value}% of {item.limit}
                </span>
              </div>
              <Progress value={item.value} />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

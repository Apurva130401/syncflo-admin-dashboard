'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const metrics = [
  {
    name: "Revenue",
    value: "$12,345",
    change: "+12.5%",
    trend: "up",
  },
  {
    name: "Leads",
    value: "1,234",
    change: "-2.1%",
    trend: "down",
  },
  {
    name: "Conversion Rate",
    value: "12.3%",
    change: "+0.5%",
    trend: "up",
  },
  {
    name: "Customer Churn",
    value: "2.1%",
    change: "0%",
    trend: "neutral",
  },
];

export function KeyMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              {metric.trend === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change} from last month</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

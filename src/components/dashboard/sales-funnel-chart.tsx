'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

const data = [
  { name: 'Impressions', value: 10000, fill: '#8884d8' },
  { name: 'Clicks', value: 5000, fill: '#83a6ed' },
  { name: 'Leads', value: 2000, fill: '#8dd1e1' },
  { name: 'Sales', value: 500, fill: '#82ca9d' },
];

export function SalesFunnelChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Sales Funnel</CardTitle>
        <CardDescription>Your sales process from impression to sale</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={data} isAnimationActive>
              <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

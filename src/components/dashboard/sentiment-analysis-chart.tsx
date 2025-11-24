'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Positive', value: 75 },
  { name: 'Neutral', value: 15 },
  { name: 'Negative', value: 10 },
];

const COLORS = ['#4CAF50', '#2196F3', '#FFC107'];

export function SentimentAnalysisChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>Customer interaction sentiment</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

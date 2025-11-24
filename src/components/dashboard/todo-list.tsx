'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { motion } from 'framer-motion'

const tasks = [
  {
    id: "1",
    label: "Review new ad creatives",
    completed: false,
  },
  {
    id: "2",
    label: "Set up new voice campaign",
    completed: false,
  },
  {
    id: "3",
    label: "Analyze WhatsApp campaign results",
    completed: true,
  },
  {
    id: "4",
    label: "Update billing information",
    completed: false,
  },
];

export function TodoList() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>To-Do List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <Checkbox id={task.id} checked={task.completed} />
              <label
                htmlFor={task.id}
                className={`text-sm font-medium leading-none ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.label}
              </label>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

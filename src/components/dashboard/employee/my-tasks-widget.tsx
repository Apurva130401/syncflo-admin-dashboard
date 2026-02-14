'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const initialTasks = [
    { id: 1, text: 'Call Alice about contract', done: false, tag: 'Urgent' },
    { id: 2, text: 'Update monthly report', done: true, tag: 'Admin' },
    { id: 3, text: 'Follow up with Green Corp', done: false, tag: 'Sales' },
    { id: 4, text: 'Prepare presentation deck', done: false, tag: 'Marketing' },
]

export function MyTasksWidget() {
    const [tasks, setTasks] = useState(initialTasks)

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
    }

    return (
        <Card className="h-full shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Tasks</CardTitle>
                    <CardDescription>To-do list for today</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded transition-colors group">
                            <Checkbox id={`task-${task.id}`} checked={task.done} onCheckedChange={() => toggleTask(task.id)} />
                            <div className="flex-1">
                                <label
                                    htmlFor={`task-${task.id}`}
                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}
                                >
                                    {task.text}
                                </label>
                                <p className="text-[10px] text-slate-400 mt-1">{task.tag}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TasksPage() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    // New Task State
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', due_date: '' })

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/tasks')
            if (res.ok) {
                const { tasks } = await res.json()
                setTasks(tasks || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const handleCreateTask = async () => {
        try {
            const res = await fetch('/api/admin/tasks', {
                method: 'POST',
                body: JSON.stringify(newTask),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                setOpen(false)
                setNewTask({ title: '', description: '', priority: 'Medium', due_date: '' })
                fetchTasks()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        // Optimistic update
        setTasks(tasks.map((t: any) => t.id === id ? { ...t, status: newStatus } : t))
        await fetch('/api/admin/tasks', {
            method: 'PATCH',
            body: JSON.stringify({ id, status: newStatus }),
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this task?')) return
        await fetch('/api/admin/tasks', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        })
        fetchTasks()
    }

    const priorityColor = (p: string) => {
        switch (p) {
            case 'Urgent': return 'bg-red-100 text-red-800'
            case 'High': return 'bg-orange-100 text-orange-800'
            case 'Low': return 'bg-blue-100 text-blue-800'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
                    <p className="text-slate-500">Manage your to-do list and assignments.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                                </div>
                            </div>
                            <Button onClick={handleCreateTask} className="w-full mt-4">Create Task</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div>Loading tasks...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task: any) => (
                        <Card key={task.id} className="relative group hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide ${priorityColor(task.priority)}`}>
                                        {task.priority}
                                    </div>
                                    {task.status === 'Done' ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-slate-300" />
                                    )}
                                </div>
                                <CardTitle className={`text-lg mt-2 ${task.status === 'Done' ? 'line-through text-slate-400' : ''}`}>
                                    {task.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
                                {task.assigned_user && (
                                    <p className="text-xs text-slate-400 mt-4">Assigned to: {task.assigned_user.email}</p>
                                )}
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={task.status === 'Done' ? 'text-slate-400' : 'text-blue-600'}
                                    onClick={() => handleStatusUpdate(task.id, task.status === 'Done' ? 'Todo' : 'Done')}
                                >
                                    {task.status === 'Done' ? 'Mark Undone' : 'Mark Done'}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-400 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(task.id)}>
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

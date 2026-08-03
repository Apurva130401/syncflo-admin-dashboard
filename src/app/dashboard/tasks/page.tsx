'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, CheckCircle, Clock, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export default function TasksPage() {
    const { toast } = useToast()
    const [tasks, setTasks] = useState<any[]>([])
    const [twentyTasks, setTwentyTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'local' | 'twenty'>('local')

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

    const syncFromTwenty = async () => {
        setSyncing(true)
        try {
            const res = await fetch('/api/admin/tasks/twenty-sync')
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to sync from Twenty CRM')
            }

            setTwentyTasks(data.tasks || [])
            setActiveTab('twenty')
            toast({
                title: 'Synced from Twenty CRM',
                description: `Loaded ${data.total} task(s) from Twenty CRM.`,
            })
        } catch (e: any) {
            toast({
                title: 'Sync Failed',
                description: e.message || 'Could not connect to Twenty CRM.',
                variant: 'destructive',
            })
        } finally {
            setSyncing(false)
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
                toast({ title: 'Task Created', description: 'New task added successfully.' })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
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
            case 'Urgent': return 'bg-red-100 text-red-800 border-red-200'
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const statusColor = (s: string) => {
        switch (s) {
            case 'Done': return 'bg-emerald-100 text-emerald-800'
            case 'In Progress': return 'bg-amber-100 text-amber-800'
            default: return 'bg-slate-100 text-slate-600'
        }
    }

    const displayTasks = activeTab === 'twenty' ? twentyTasks : tasks

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
                    <p className="text-slate-500">Manage your to-do list and assignments.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Twenty CRM Sync Button */}
                    <Button
                        variant="outline"
                        onClick={syncFromTwenty}
                        disabled={syncing}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
                    >
                        {syncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        {syncing ? 'Syncing...' : 'Sync from Twenty CRM'}
                    </Button>

                    {/* New Task Dialog */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
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
            </div>

            {/* Tab Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('local')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'local' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Local Tasks {tasks.length > 0 && <span className="ml-1.5 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">{tasks.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('twenty')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'twenty' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Twenty CRM {twentyTasks.length > 0 && <span className="ml-0.5 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">{twentyTasks.length}</span>}
                </button>
            </div>

            {/* Task Grid */}
            {loading && activeTab === 'local' ? (
                <div className="flex items-center gap-2 text-slate-500 py-8">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading tasks...
                </div>
            ) : activeTab === 'twenty' && twentyTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                    <RefreshCw className="h-10 w-10 text-slate-300" />
                    <p className="font-medium text-slate-500">No Twenty CRM tasks synced yet</p>
                    <p className="text-sm">Click <strong>"Sync from Twenty CRM"</strong> to pull your tasks.</p>
                </div>
            ) : displayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                    <Clock className="h-10 w-10 text-slate-300" />
                    <p className="font-medium text-slate-500">No tasks found</p>
                    <p className="text-sm">Create a new task using the button above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayTasks.map((task: any) => (
                        <Card key={task.id} className="relative group hover:shadow-md transition-shadow border-slate-200">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wide ${priorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                        {task.source === 'twenty_crm' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold flex items-center gap-1">
                                                <ExternalLink className="h-2.5 w-2.5" /> Twenty CRM
                                            </span>
                                        )}
                                    </div>
                                    {task.status === 'Done' ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-slate-300 shrink-0" />
                                    )}
                                </div>
                                <CardTitle className={`text-base mt-2 leading-snug ${task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                    {task.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
                                {task.assigned_user && (
                                    <p className="text-xs text-slate-400 mt-3">
                                        Assigned to: <span className="font-medium text-slate-600">{task.assigned_user.email || [task.assigned_user.first_name, task.assigned_user.last_name].filter(Boolean).join(' ')}</span>
                                    </p>
                                )}
                                {task.due_date && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Due: <span className="font-medium text-slate-600">{task.due_date}</span>
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-between">
                                {task.source !== 'twenty_crm' ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={task.status === 'Done' ? 'text-slate-400' : 'text-slate-700'}
                                            onClick={() => handleStatusUpdate(task.id, task.status === 'Done' ? 'Todo' : 'Done')}
                                        >
                                            {task.status === 'Done' ? 'Mark Undone' : 'Mark Done'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 opacity-0 group-hover:opacity-100"
                                            onClick={() => handleDelete(task.id)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Read-only · Synced from Twenty CRM</p>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

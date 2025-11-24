'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, RefreshCw, Save } from 'lucide-react'

interface SystemHealth {
    id: string
    health: string
    status: string
    uptime: number
    response_time: number
    active_alerts: number
    last_updated: string
}

export default function MonitoringPage() {
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchHealthData()
    }, [])

    const fetchHealthData = async () => {
        try {
            const response = await fetch('/api/admin/system-health')
            const result = await response.json()

            if (!response.ok) {
                console.error('Error fetching health data:', result.error)
                return
            }

            setHealth(result.health)
        } catch (error) {
            console.error('Exception during fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateHealthData = async (updates: Partial<SystemHealth>) => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/system-health', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            const result = await response.json()

            if (!response.ok) {
                console.error('Error updating health data:', result.error)
                return
            }

            setHealth(result.health)
        } catch (error) {
            console.error('Exception during update:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleMetricChange = (metric: string, value: number | string) => {
        if (!health) return
        setHealth({ ...health, [metric]: value })
    }

    const handleHealthChange = (healthValue: string) => {
        if (!health) return
        updateHealthData({ health: healthValue })
    }

    const handleStatusChange = (statusValue: string) => {
        if (!health) return
        updateHealthData({ status: statusValue })
    }

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'healthy': return 'text-green-600'
            case 'warning': return 'text-yellow-600'
            case 'critical': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
            default: return <Activity className="h-4 w-4 text-gray-500" />
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!health) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">Failed to load system health data</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                    System Monitoring
                </h1>
                <p className="text-slate-600 mt-2 text-lg">Real-time system health, performance metrics, and infrastructure status</p>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        {getHealthIcon(health.health)}
                    </CardHeader>
                    <CardContent>
                        <Select value={health.health} onValueChange={handleHealthChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="healthy">Healthy</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                            Overall system health
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Select value={health.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="operational">Operational</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="degraded">Degraded</SelectItem>
                                <SelectItem value="down">Down</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                            Current operational status
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                value={health.uptime}
                                onChange={(e) => handleMetricChange('uptime', parseFloat(e.target.value))}
                                className="w-20"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <span className="text-sm font-bold">%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            System uptime percentage
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                value={health.response_time}
                                onChange={(e) => handleMetricChange('response_time', parseInt(e.target.value))}
                                className="w-20"
                            />
                            <span className="text-sm font-bold">ms</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Average API response time
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <Button onClick={fetchHealthData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                </Button>
                <Button onClick={() => updateHealthData(health)} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Detailed Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Metrics</CardTitle>
                        <CardDescription>Key performance indicators and system statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Uptime Percentage</Label>
                                    <div className="mt-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl font-bold text-blue-600">{health.uptime}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${health.uptime}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Response Time</Label>
                                    <div className="mt-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl font-bold text-green-600">{health.response_time}</span>
                                            <span className="text-sm text-muted-foreground">ms</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Last Updated</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(health.last_updated).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Alerts</CardTitle>
                        <CardDescription>Current system alerts and notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium">Active Alerts</p>
                                        <p className="text-xs text-muted-foreground">Number of current system alerts</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="number"
                                        value={health.active_alerts}
                                        onChange={(e) => handleMetricChange('active_alerts', parseInt(e.target.value))}
                                        className="w-16 h-8 text-center"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="text-center py-4">
                                <p className="text-3xl font-bold text-orange-600">{health.active_alerts}</p>
                                <p className="text-sm text-muted-foreground">Active system alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
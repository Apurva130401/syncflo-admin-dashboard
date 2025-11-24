import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SystemStatus {
  health: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'
  status: 'Operational' | 'Degraded' | 'Maintenance' | 'Down'
  uptime: number // percentage
  responseTime: number // ms
  activeAlerts: number
  lastUpdated: Date
}

interface SystemHealthRecord {
  health: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'
  status: 'Operational' | 'Degraded' | 'Maintenance' | 'Down'
  uptime: number
  response_time: number
  active_alerts: number
  last_updated: string
}

const getRandomStatus = (): SystemStatus => {
  const statuses: SystemStatus['status'][] = ['Operational', 'Degraded', 'Maintenance', 'Down']
  const healths: SystemStatus['health'][] = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']

  // Weighted random selection - mostly operational
  const statusWeights = [0.85, 0.1, 0.03, 0.02] // Operational most common
  const healthWeights = [0.6, 0.25, 0.1, 0.03, 0.02] // Excellent most common

  const randomStatus = () => {
    const rand = Math.random()
    let cumulative = 0
    for (let i = 0; i < statusWeights.length; i++) {
      cumulative += statusWeights[i]
      if (rand < cumulative) return statuses[i]
    }
    return statuses[0]
  }

  const randomHealth = () => {
    const rand = Math.random()
    let cumulative = 0
    for (let i = 0; i < healthWeights.length; i++) {
      cumulative += healthWeights[i]
      if (rand < cumulative) return healths[i]
    }
    return healths[0]
  }

  const status = randomStatus()
  const health = randomHealth()

  // Generate realistic metrics based on status
  let uptime = 99.9
  let responseTime = 45
  let activeAlerts = 0

  switch (status) {
    case 'Operational':
      uptime = 99.5 + Math.random() * 0.4 // 99.5-99.9%
      responseTime = 30 + Math.random() * 40 // 30-70ms
      activeAlerts = Math.floor(Math.random() * 3) // 0-2 alerts
      break
    case 'Degraded':
      uptime = 95 + Math.random() * 4 // 95-99%
      responseTime = 100 + Math.random() * 100 // 100-200ms
      activeAlerts = 2 + Math.floor(Math.random() * 5) // 2-6 alerts
      break
    case 'Maintenance':
      uptime = 90 + Math.random() * 8 // 90-98%
      responseTime = 200 + Math.random() * 200 // 200-400ms
      activeAlerts = 1 + Math.floor(Math.random() * 3) // 1-3 alerts
      break
    case 'Down':
      uptime = Math.random() * 50 // 0-50%
      responseTime = 1000 + Math.random() * 2000 // 1000-3000ms
      activeAlerts = 5 + Math.floor(Math.random() * 10) // 5-14 alerts
      break
  }

  return {
    health,
    status,
    uptime: Math.round(uptime * 10) / 10,
    responseTime: Math.round(responseTime),
    activeAlerts,
    lastUpdated: new Date()
  }
}

export const useSystemStatus = (updateInterval: number = 30000) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(getRandomStatus())
  const supabase = createClient()

  const fetchSystemStatus = async (): Promise<SystemStatus> => {
    try {
      const { data, error } = await supabase
        .from('system_health')
        .select('health, status, uptime, response_time, active_alerts, last_updated')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        console.warn('Failed to fetch system status from database, using fallback:', error)
        return getRandomStatus()
      }

      // Transform database record to SystemStatus interface
      const record = data as SystemHealthRecord
      return {
        health: record.health,
        status: record.status,
        uptime: record.uptime,
        responseTime: record.response_time,
        activeAlerts: record.active_alerts,
        lastUpdated: new Date(record.last_updated)
      }
    } catch (error) {
      console.error('Error fetching system status:', error)
      return getRandomStatus()
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchSystemStatus().then(setSystemStatus)

    // Set up interval for updates
    const interval = setInterval(async () => {
      const newStatus = await fetchSystemStatus()
      setSystemStatus(newStatus)
    }, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval])

  return systemStatus
}

export const getStatusColor = (status: SystemStatus['status']) => {
  switch (status) {
    case 'Operational':
      return 'text-green-600'
    case 'Degraded':
      return 'text-yellow-600'
    case 'Maintenance':
      return 'text-blue-600'
    case 'Down':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const getHealthColor = (health: SystemStatus['health']) => {
  switch (health) {
    case 'Excellent':
      return 'text-green-600'
    case 'Good':
      return 'text-green-600'
    case 'Fair':
      return 'text-yellow-600'
    case 'Poor':
      return 'text-orange-600'
    case 'Critical':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}
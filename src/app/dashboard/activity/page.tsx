'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface Activity {
  id: string
  user_id: string
  action: string
  details?: string
  created_at: string
  user_email?: string
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // For now, show recent user updates as activity
        // In a real implementation, you'd have an activity/audit log table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, updated_at')
          .order('updated_at', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Error fetching activities:', error)
        } else {
          const activityData = (data || []).map(user => ({
            id: `activity-${user.id}`,
            user_id: user.id,
            action: 'Profile Updated',
            details: 'User profile was modified',
            created_at: user.updated_at,
            user_email: user.email
          }))
          setActivities(activityData)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Activity</h1>
        <p className="text-gray-600">Monitor user actions and system events</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest user actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.user_email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.action}</Badge>
                  </TableCell>
                  <TableCell>{activity.details}</TableCell>
                  <TableCell>
                    {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
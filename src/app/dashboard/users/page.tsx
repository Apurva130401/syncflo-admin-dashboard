'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role?: string
  created_at: string
  updated_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users from API...')

        const response = await fetch('/api/admin/users')
        const result = await response.json()

        if (!response.ok) {
          console.error('Error fetching users:', result.error)
          return
        }

        console.log('Fetched users successfully:', result.users)
        console.log('Number of users:', result.users?.length || 0)
        setUsers(result.users || [])
      } catch (error) {
        console.error('Exception during fetch:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleToggleRole = async (userId: string, currentRole?: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error updating role:', result.error)
        return
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error deleting user:', result.error)
        return
      }

      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Manage all registered users and their permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>
            View and manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.first_name || user.last_name || 'N/A'
                    }
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.updated_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRole(user.id, user.role)}
                      >
                        {user.role === 'admin' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
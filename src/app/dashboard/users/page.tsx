'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, UserCheck, UserX, AlertTriangle, Loader2 } from 'lucide-react'
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
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error loading users',
          description: result.error || 'Failed to fetch registered users.',
          variant: 'destructive'
        })
        return
      }

      setUsers(result.users || [])
    } catch (error) {
      console.error('Exception during fetch:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the server.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

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
        toast({
          title: 'Role update failed',
          description: result.error || 'Could not update user role.',
          variant: 'destructive'
        })
        return
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}.`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userToDelete.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Delete Failed',
          description: result.error || 'Could not delete user account.',
          variant: 'destructive'
        })
        return
      }

      setUsers(users.filter(user => user.id !== userToDelete.id))
      toast({
        title: 'User Permanently Deleted',
        description: `Successfully removed ${userToDelete.email} from Auth & Database.`,
      })
      setUserToDelete(null)
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting user.',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading user accounts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Manage all registered users and their permissions</p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">All Users ({users.length})</CardTitle>
          <CardDescription>
            View and manage user accounts, roles, and permissions across SyncFlo AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Last Updated</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.first_name || user.last_name || <span className="text-slate-400 italic">N/A</span>
                      }
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="rounded-lg">
                        {user.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {user.updated_at ? format(new Date(user.updated_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleRole(user.id, user.role)}
                          className="rounded-lg text-xs"
                          title="Toggle Admin Role"
                        >
                          {user.role === 'admin' ? (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-1 text-amber-600" /> Make User
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Make Admin
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setUserToDelete(user)}
                          className="rounded-lg text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* STYLED DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Permanently Delete User
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete account <span className="font-semibold text-slate-900 font-mono">{userToDelete?.email}</span>?
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              ⚠️ Permanent Action Warning
            </div>
            <p>
              This will permanently erase the user from Supabase <code className="font-mono bg-red-100 px-1 py-0.5 rounded text-red-900">auth.users</code> authentication and remove their record from the database. This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Permanently Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
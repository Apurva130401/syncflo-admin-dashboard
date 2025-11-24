'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UnauthorizedPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-black">Access Denied</CardTitle>
          <CardDescription className="text-black">
            You do not have permission to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-black mb-4">
            Only administrators can access this area. Please contact support if you believe this is an error.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
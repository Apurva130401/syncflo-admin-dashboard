'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UnauthorizedPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleGoToLogin = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Access Denied</CardTitle>
          <CardDescription className="text-slate-400">
            You do not have permission to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Only administrators can access this area. Please contact support if you believe this is an error.
          </p>
          <Button onClick={handleGoToLogin} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
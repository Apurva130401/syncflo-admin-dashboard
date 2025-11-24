'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check for existing session on component mount
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Valid session exists, redirect to dashboard
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }

      // Check remember me preference
      if (localStorage.getItem('rememberMe') === 'true') {
        setRememberMe(true)
      }

      // Try to restore session from localStorage
      const storedSession = localStorage.getItem('supabase.auth.token')
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession)
          if (sessionData && sessionData.access_token) {
            // Attempt to restore the session
            const { data, error } = await supabase.auth.setSession({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token
            })

            if (data.session && !error) {
              setTimeout(() => {
                router.push('/dashboard')
              }, 100)
              return
            }
          }
        } catch (error) {
          console.error('Error restoring session:', error)
          // Clear invalid session data
          localStorage.removeItem('supabase.auth.token')
        }
      }
    }

    checkExistingSession()
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('Starting login attempt for email:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log('Login response:', { data: !!data, error: error?.message })

    if (error) {
      console.log('Login failed with error:', error.message)
      setError(error.message)
      setLoading(false)
    } else {
      console.log('Login successful, session exists:', !!data.session)
      // Store session information for persistence
      if (data.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session))
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          // NOTE: Session duration cannot be extended from the client SDK.
          // Session lifetime should be configured in Supabase Auth settings.
        } else {
          localStorage.removeItem('rememberMe')
        }
      }

      console.log('Login successful, letting auth state change listener handle redirect')
      // Reset loading state - the Providers component will handle the redirect on SIGNED_IN event
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-semibold text-base">Email Address</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg h-12 pl-4 pr-4"
            />
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white font-semibold text-base">Password</Label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg h-12 pl-4 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="remember-me" className="ml-2 block text-sm text-white font-medium">
              Remember me for 30 days
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-12"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing you in...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span>Sign In to Dashboard</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600 text-sm">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline font-medium">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline font-medium">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

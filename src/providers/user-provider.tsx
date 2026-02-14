'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type Profile = {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
    company_name?: string
    personal_phone?: string
    avatar_url?: string
    employee_id?: string
    [key: string]: any
}

type UserContextType = {
    user: User | null
    profile: Profile | null
    loading: boolean
    refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    const fetchUserData = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                // Determine if we are on a public route or need redirect
                // For now, just set loading false and let protected routes handle redirect if needed
                setUser(null)
                setProfile(null)
                return
            }

            setUser(user)

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setProfile(profileData)
                // Role check moved here if centralized restriction is needed
                if (profileData.role === 'user') {
                    router.push('/')
                }
            } else if (profileError) {
                console.error('Error fetching profile:', profileError)
            }

        } catch (error) {
            console.error('Unexpected error in UserProvider:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserData()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
                router.push('/login')
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    setUser(session.user)
                    // Optionally re-fetch profile on sign-in if needed
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()
                    if (data) setProfile(data)
                }
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase])

    const refreshProfile = async () => {
        if (!user) return
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileData) {
            setProfile(profileData)
        }
    }

    return (
        <UserContext.Provider value={{ user, profile, loading, refreshProfile }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}

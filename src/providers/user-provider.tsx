'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
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
    [key: string]: unknown
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
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    const fetchProfile = useCallback(async (userId: string) => {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileData) {
            setProfile(profileData)
        } else {
            setProfile(null)
            if (profileError) {
                console.error('Error fetching profile:', profileError)
            }
        }
    }, [supabase])

    const fetchUserData = useCallback(async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            const sessionUser = session?.user ?? null

            if (sessionError || !sessionUser) {
                setUser(null)
                setProfile(null)
                return
            }

            setUser(sessionUser)
            await fetchProfile(sessionUser.id)

        } catch (error) {
            console.error('Unexpected error in UserProvider:', error)
        } finally {
            setLoading(false)
        }
    }, [fetchProfile, supabase])

    useEffect(() => {
        fetchUserData()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
                router.push('/login')
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    setUser(session.user)
                    await fetchProfile(session.user.id)
                }
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchProfile, fetchUserData, router, supabase])

    const refreshProfile = useCallback(async () => {
        if (!user) return
        await fetchProfile(user.id)
    }, [fetchProfile, user])

    const value = useMemo(
        () => ({ user, profile, loading, refreshProfile }),
        [user, profile, loading, refreshProfile]
    )

    return (
        <UserContext.Provider value={value}>
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

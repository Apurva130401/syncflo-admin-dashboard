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
const AUTH_REQUEST_TIMEOUT_MS = 8000

function withTimeout<T>(promise: PromiseLike<T>, message: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            reject(new Error(message))
        }, AUTH_REQUEST_TIMEOUT_MS)

        Promise.resolve(promise)
            .then(resolve, reject)
            .finally(() => {
                window.clearTimeout(timeoutId)
            })
    })
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const profileRequest = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            type ProfileResponse = Awaited<typeof profileRequest>

            const { data: profileData, error: profileError } = await withTimeout(
                profileRequest as PromiseLike<ProfileResponse>,
                'Timed out while loading profile'
            )

            if (profileData) {
                setProfile(profileData)
            } else {
                setProfile(null)
                if (profileError) {
                    console.error('Error fetching profile:', profileError)
                }
            }
        } catch (error) {
            setProfile(null)
            console.error('Error fetching profile:', error)
        }
    }, [supabase])

    const fetchUserData = useCallback(async () => {
        try {
            const sessionRequest = supabase.auth.getSession()
            type SessionResponse = Awaited<typeof sessionRequest>

            const { data: { session }, error: sessionError } = await withTimeout(
                sessionRequest as PromiseLike<SessionResponse>,
                'Timed out while loading auth session'
            )
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
                setLoading(false)
                router.push('/login')
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (session?.user) {
                    setUser(session.user)
                    window.setTimeout(() => {
                        void fetchProfile(session.user.id)
                    }, 0)
                } else if (event === 'INITIAL_SESSION') {
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
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

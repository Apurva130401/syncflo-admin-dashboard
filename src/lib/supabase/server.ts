import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    try {
                        if (typeof cookieStore.getAll === 'function') {
                            const cookies = cookieStore.getAll()
                            return cookies
                        }
                    } catch (e) {
                        // console.error('DEBUG: cookieStore.getAll failed', e)
                    }
                    // Fallback: Try identifying as iterable (Next.js 15/16 ResponseCookies)
                    try {
                        const cookies = []
                        // @ts-ignore
                        for (const cookie of cookieStore) {
                            cookies.push(cookie)
                        }
                        return cookies
                    } catch (e) {
                        console.error('DEBUG: cookieStore fallback failed', e)
                        return []
                    }
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

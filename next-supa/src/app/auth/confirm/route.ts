// app/auth/callback/route.ts (or wherever your callback handler lives)

import { cookies } from 'next/headers' // ⬅️ Must import cookies
import { createClient } from '@/lib/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

// Define the type for the synchronous cookie object (from lib/server.ts)
type CookieStore = { 
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: any) => void;
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const _next = searchParams.get('next')
    const next = _next?.startsWith('/') ? _next : '/'

    if (token_hash && type) {
        // 1. Get the cookie store and use the type assertion
        const cookieStore = cookies() as unknown as CookieStore
        
        // 2. ✅ FIX: Call your custom client synchronously and pass the cookie store
        const supabase = createClient(cookieStore)

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        
        if (!error) {
            // redirect user to specified redirect URL or root of app
            redirect(next)
        } else {
            // redirect the user to an error page with some instructions
            redirect(`/auth/error?error=${error?.message}`)
        }
    }

    // redirect the user to an error page with some instructions
    redirect(`/auth/error?error=No token hash or type`)
}
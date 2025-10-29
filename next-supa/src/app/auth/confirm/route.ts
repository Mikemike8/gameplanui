// src/app/auth/confirm/route.ts

import { cookies } from 'next/headers' // ⬅️ IMPORT the cookies function
import { createClient } from '@/lib/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

// Define the type for the synchronous cookie object (from lib/server.ts)
// This is necessary to satisfy the strict TypeScript build environment.
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
        //    This resolves the "Expected 1 arguments, but got 0" error.
        const supabase = createClient(cookieStore) // ⬅️ PASSES THE ARGUMENT

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        
        if (!error) {
            redirect(next)
        } else {
            redirect(`/auth/error?error=${error?.message}`)
        }
    }

    redirect(`/auth/error?error=No token hash or type`)
}
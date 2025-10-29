// lib/server.ts
import { createServerClient } from '@supabase/ssr'

/**
 * Create a Supabase server client WITHOUT actually using cookies
 */
export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [], // return empty array
        setAll: (_cookies: any[]) => {}, // do nothing
      },
    }
  )
}

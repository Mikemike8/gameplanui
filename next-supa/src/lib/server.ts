// lib/server.ts

import { createServerClient as createSupabaseClientFromSSR } from '@supabase/ssr'; // 👈 Use an alias for the import

// ✅ Export your custom function with a unique name
export const createClient = (cookieStore: { 
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: any) => void;
}) => {
  return createSupabaseClientFromSSR( // 👈 Use the aliased name here
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          } catch (e) { } 
        },
      },
    }
  );
};
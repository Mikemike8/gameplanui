// app/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from '@/lib/server'; // Your custom utility function
import { LoginForm } from "@/components/login-form";

// Define the precise type of the object returned by cookies() 
// (or extract it from your lib/server.ts if possible)
type CookieStore = { 
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: any) => void;
};

export default async function IndexPage() {
  // 1. Get the cookie store. 
  // 2. ✅ FIX: Use a Type Assertion (as CookieStore) to tell TypeScript 
  //    that the result is the synchronous object your utility expects.
  const cookieStore = cookies() as unknown as CookieStore; 
  
  // 3. Pass the correctly-typed store to your utility function.
  //    This resolves the Argument of type 'Promise<...>' error.
  const supabase = createClient(cookieStore); 
  
  // 4. Perform the session check
  const { data: { user } } = await supabase.auth.getUser(); 

  if (user) {
    redirect('/protected');
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
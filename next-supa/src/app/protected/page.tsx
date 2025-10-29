// app/protected/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from '@/lib/server'; // Your custom utility function
import { Dashboard } from "@/components/Dashboard/Dashboard";

// Define the precise type of the synchronous cookie object your utility expects.
// This matches the signature in your lib/server.ts
type CookieStore = { 
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: any) => void;
};

export default async function ProtectedPage() {
    // 1️⃣ Get the cookie store. 
    // 2️⃣ FIX: Use a Type Assertion (as unknown as CookieStore) 
    //    to bypass the conflicting Promise type and tell TypeScript 
    //    that the result is the synchronous object your utility expects.
    const cookieStore = cookies() as unknown as CookieStore; 
    
    // 3️⃣ Pass the correctly-typed store to your utility function.
    const supabase = createClient(cookieStore); 

    // 4️⃣ Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // 5️⃣ Redirect if not logged in
    if (!user) {
        redirect("/sign-in");
    }

    // 6️⃣ Render dashboard
    return (
        <div className="flex flex-col w-full h-full overflow-y-auto">
            {/* ... Dashboard rendering ... */}
            <h1 className="text-xl font-semibold">
                Welcome back, {user.email} 👋
            </h1>
            <Dashboard />
        </div>
    );
}
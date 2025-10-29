// app/protected/layout.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// ✅ Import your custom, error-free server client utility
import { createClient } from '@/lib/server'; 
import { Navbar } from "@/components/Navbar/Navbar";

// Define the type for the synchronous cookie object (from lib/server.ts)
type CookieStore = { 
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => Array<{ name: string; value: string }>;
    set: (name: string, value: string, options?: any) => void;
};

export default async function ProtectedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 1️⃣ FIX: Get the cookie store and use a Type Assertion
  //    to bypass the conflicting Promise type.
  const cookieStore = cookies() as unknown as CookieStore; 

  // 2️⃣ FIX: Use the custom utility, which handles the complex cookie logic.
  const supabase = createClient(cookieStore);

  // 3️⃣ Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  // 4️⃣ Redirect if not logged in
  if (!user) { // Removed 'error ||' as checking for user is sufficient for auth
    redirect("/sign-in");
  }

  const email = user.email || "User";

  // 5️⃣ Render layout with Navbar
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <Navbar email={email} />
      <main className="flex-1 overflow-auto p-6 bg-stone-50">{children}</main>
    </div>
  );
}
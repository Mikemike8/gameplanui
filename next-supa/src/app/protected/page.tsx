// app/protected/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard/Dashboard";

export default async function ProtectedPage() {
  // 1️⃣ Get the cookie store
  const cookieStore = await cookies();

  // 2️⃣ Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // No-op for server components
      } 
    }
  );

  // 3️⃣ Get the current user
  const { data: { user }, error } = await supabase.auth.getUser();

  // 4️⃣ Redirect if not logged in
  if (error || !user) {
    redirect("/sign-in");
  }

  // 5️⃣ Render dashboard
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="border-b border-stone-300 pb-2 mb-4">
        <h1 className="text-xl font-semibold">
          Welcome back, {user.email} 👋
        </h1>
        <p className="text-stone-500 text-sm">
          Here's your dashboard summary and chat feed.
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
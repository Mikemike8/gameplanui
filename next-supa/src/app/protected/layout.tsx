// app/protected/layout.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Navbar } from "@/components/Navbar/Navbar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // 1️⃣ Get the cookie store
  const cookieStore = await cookies();

  // 2️⃣ Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // 3️⃣ Get the current user claims
  const { data, error } = await supabase.auth.getClaims();

  // 4️⃣ Redirect if not logged in
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = data.claims.email;

  // 5️⃣ Render layout with Navbar
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <Navbar email={email} />
      <main className="flex-1 overflow-auto p-6 bg-stone-50">{children}</main>
    </div>
  );
}

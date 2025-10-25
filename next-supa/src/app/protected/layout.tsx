// app/protected/layout.tsx
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { createClient } from "@/lib/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login"); // redirect if not authenticated
  }

  const email = data.claims.email;

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar appears on ALL protected pages */}
      <aside className="w-[260px] border-r border-stone-300 bg-white p-4">
        <Sidebar email={email} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {children}</main>
    </div>
  );
}

// app/protected/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { Navbar } from "@/components/Navbar/Navbar";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = data.claims.email;

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <Navbar email={email} />
      <main className="flex-1 overflow-auto p-0.5 bg-stone-50">{children}</main>
    </div>
  );
}

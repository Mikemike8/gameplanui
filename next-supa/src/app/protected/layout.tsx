// src/app/protected/layout.tsx
import { auth0 } from "@/lib/auth0";  // Import the client
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar/Navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Get session from cookies
  const session = await auth0.getSession();

  // 🚫 Redirect if user not logged in
  if (!session || !session.user) {
    redirect("/auth/login?returnTo=/protected");  // Updated path
  }

  const email = session.user.email || "User";

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <Navbar email={email} />
      <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-stone-50">
        <div className="max-w-7xl ">
          {children}
        </div>
      </main>
    </div>
  );
}
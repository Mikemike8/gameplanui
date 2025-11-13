// src/app/protected/layout.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { Navbar } from "@/components/Navbar/Navbar";
import { getOrCreateBackendUser, getMyWorkspaces } from "@/lib/workspaces";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/auth/login?returnTo=/protected");
  }

  // Sync backend user
  const backendUser = await getOrCreateBackendUser(session.user);

  // Check workspaces
  const workspaces = await getMyWorkspaces(backendUser.id);

  // 👇 If the user has no workspaces, send them to the create/join page
  if (workspaces.length === 0) {
    redirect("/protected/spaces");
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <Navbar email={session.user.email || "User"} />
      <main className="flex-1 overflow-auto p-4 bg-stone-50">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

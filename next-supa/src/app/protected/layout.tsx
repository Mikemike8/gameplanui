// src/app/protected/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, type Auth0User } from "@/lib/workspaces";
import { UserProvider } from "@/context/UserContext";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Sync backend user
  const backendUser = await getOrCreateBackendUser(session.user as Auth0User);

  // Store in localStorage on the client
  const serializedUser = JSON.stringify(backendUser);

  return (
    <UserProvider>
      <script
        dangerouslySetInnerHTML={{
          __html: `localStorage.setItem("backendUser", '${serializedUser.replace(/'/g, "\\'")}');`,
        }}
      />
      {/* Chat renders full-screen, other routes can scroll */}
      <main className="min-h-screen bg-background">{children}</main>
    </UserProvider>
  );
}

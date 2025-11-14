// src/app/protected/onboarding/page.tsx
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { getOrCreateBackendUser, type Auth0User } from "@/lib/workspaces";
import { WorkspaceOnboarding } from "@/components/Workspace/WorkspaceOnboarding";

export default async function OnboardingPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const backendUser = await getOrCreateBackendUser(session.user as Auth0User);

  return <WorkspaceOnboarding userId={backendUser.id} />;
}
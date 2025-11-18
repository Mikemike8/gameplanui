// src/app/protected/page.tsx

import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, fetchMyWorkspaces, type Auth0User } from "@/lib/workspaces";
import { buildAuthRoute } from "@/lib/auth-routes";

export default async function ProtectedIndexPage() {
  const session = await auth0.getSession();
  if (!session?.user) redirect(buildAuthRoute("login"));

  const backendUser = await getOrCreateBackendUser(session.user as Auth0User);
  const workspaces = await fetchMyWorkspaces(backendUser.id);

  const hasNonPersonalWorkspace = workspaces.some((w) => !w.is_personal);

  if (!workspaces.length || !hasNonPersonalWorkspace) {
    redirect("/protected/onboarding");
  }

  const defaultWorkspace = workspaces.find((w) => !w.is_personal) ?? workspaces[0];
  redirect(`/protected/workspace/${defaultWorkspace.id}`);
}

// src/app/protected/page.tsx

import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import {
  getOrCreateBackendUser,
  fetchMyWorkspaces,
  type Auth0User,
} from "@/lib/workspaces";

export default async function ProtectedIndexPage() {
  const session = await auth0.getSession();
  if (!session?.user) redirect("/auth/login");

  const backendUser = await getOrCreateBackendUser(session.user as Auth0User);
  const workspaces = await fetchMyWorkspaces(backendUser.id);

  if (!workspaces.length) {
    redirect("/protected/spaces"); // prompt to create/join
  }

  const defaultWorkspace = workspaces.find(w => w.is_personal) ?? workspaces[0];
  redirect(`/protected/workspace/${defaultWorkspace.id}`);
}

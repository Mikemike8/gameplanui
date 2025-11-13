// src/app/protected/create/page.tsx
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { CreateWorkspaceForm } from "@/components/Workspace/CreateWorkspaceForm";
import { getOrCreateBackendUser } from "@/lib/workspaces";

export default async function CreatePage() {
  const session = await auth0.getSession();
  if (!session?.user) redirect("/auth/login");

  const backendUser = await getOrCreateBackendUser(session.user);

  return <CreateWorkspaceForm userId={backendUser.id} />;
}

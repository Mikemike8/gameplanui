// src/app/protected/create/page.tsx
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { getOrCreateBackendUser } from "@/lib/workspaces";
import { CreateWorkspaceForm } from "@/components/Workspace/CreateWorkspaceForm";
import type { Auth0User } from "@/lib/workspaces";

export default async function CreatePage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=/protected/create");
  }

 const backendUser = await getOrCreateBackendUser(session.user as Auth0User);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Create a new space
      </h1>
      <p className="text-sm text-stone-600">
        Spaces keep your channels, files, and activity organized by team or project.
      </p>
      <CreateWorkspaceForm userId={backendUser.id} />
    </div>
  );
}

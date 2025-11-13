// src/app/protected/spaces/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, getMyWorkspaces } from "@/lib/workspaces";
import { WorkspaceList } from "@/components/Workspace/WorkspaceList";
import { JoinWorkspaceForm } from "@/components/Workspace/JoinWorkspaceForm";
import { Button } from "@/components/ui/button";

export default async function SpacesPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/auth/login?returnTo=/protected/spaces");
  }

  const backendUser = await getOrCreateBackendUser(session.user);
  const workspaces = await getMyWorkspaces(backendUser.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            Your Spaces
          </h1>
          <p className="text-sm text-stone-600">
            Personal and team workspaces connected to your account.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/protected/spaces/create">
            <Button size="sm">Create new space</Button>
          </Link>
        </div>
      </div>

      {/* Workspace list */}
      <WorkspaceList workspaces={workspaces} />

      {/* Join via invite code */}
      <div className="mt-8 max-w-md">
        <JoinWorkspaceForm userId={backendUser.id} />
      </div>
    </div>
  );
}

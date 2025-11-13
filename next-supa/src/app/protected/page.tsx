// src/app/protected/workspace/[workspaceId]/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import {
  getOrCreateBackendUser,
  getWorkspace,
  getMyWorkspaces
} from "@/lib/workspaces";
import { Button } from "@/components/ui/button";

export default async function WorkspacePage({ params }) {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect(`/auth/login?returnTo=/protected/workspace/${params.workspaceId}`);
  }

  // Sync with backend
  const backendUser = await getOrCreateBackendUser(session.user);

  // Ensure user is a member of this workspace
  const myWorkspaces = await getMyWorkspaces(backendUser.id);
  const allowed = myWorkspaces.find(w => w.id === params.workspaceId);

  if (!allowed) {
    redirect("/protected/spaces"); // Not allowed
  }

  // Load workspace details
  const workspace = await getWorkspace(params.workspaceId);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {workspace.name}
          </h1>
          <p className="text-sm text-stone-600">
            {workspace.description || "No description yet."}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/protected/workspace/${workspace.id}/settings`}>
            <Button variant="outline" size="sm">Workspace settings</Button>
          </Link>

          <Link href={`/protected/workspace/${workspace.id}/chat`}>
            <Button size="sm">Open team chat</Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-md bg-white p-4">
          <h2 className="text-sm font-semibold mb-2">Activity</h2>
          <p className="text-xs text-stone-600">
            Workspace-specific dashboards, metrics, etc.
          </p>
        </div>

        <div className="border rounded-md bg-white p-4">
          <h2 className="text-sm font-semibold mb-2">Channels</h2>
          <p className="text-xs text-stone-600">
            This will list channels inside this workspace.
          </p>
        </div>
      </section>
    </div>
  );
}

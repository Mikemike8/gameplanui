// src/app/protected/workspace/[workspaceId]/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import {
  getOrCreateBackendUser,
  getWorkspace,
  getMyWorkspaces,
} from "@/lib/workspaces";
import { Button } from "@/components/ui/button";

interface WorkspacePageProps {
  params: { workspaceId: string };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect(`/auth/login?returnTo=/protected/workspace/${params.workspaceId}`);
  }

  // Sync user with backend
  const backendUser = await getOrCreateBackendUser(session.user);

  // Fetch all workspaces the user belongs to
  const mySpaces = await getMyWorkspaces(backendUser.id);

  // Make sure the user is a member of THIS workspace
  const isMember = mySpaces.some(
    (space) => space.id === params.workspaceId
  );

  if (!isMember) {
    redirect("/protected/spaces"); // Block access
  }

  // Now safely load workspace details
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
            <Button variant="outline" size="sm">
              Workspace settings
            </Button>
          </Link>
          <Link href="/protected/chat">
            <Button size="sm">Open team chat</Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-md bg-white p-4">
          <h2 className="text-sm font-semibold mb-2">Activity</h2>
          <p className="text-xs text-stone-600">
            Later we can embed workspace-specific dashboards, metrics, or recent events.
          </p>
        </div>

        <div className="border rounded-md bg-white p-4">
          <h2 className="text-sm font-semibold mb-2">Channels</h2>
          <p className="text-xs text-stone-600">
            Once channels are tied to workspaces, this area can list and manage them.
          </p>
        </div>
      </section>
    </div>
  );
}

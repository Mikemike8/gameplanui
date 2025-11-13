// src/app/protected/workspace/[workspaceId]/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, getWorkspace } from "@/lib/workspaces";
import { Button } from "@/components/ui/button";

interface WorkspacePageProps {
  params: { workspaceId: string };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const session = await auth0.getSession();

  // If no Auth0 session → send to login
  if (!session?.user) {
    redirect(`/auth/login?returnTo=/protected/workspace/${params.workspaceId}`);
  }

  // Make sure the backend user exists
  await getOrCreateBackendUser(session.user);

  // Load workspace data from backend
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

      {/* Placeholder sections – these can be wired later */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-md bg-white p-4">
          <h2 className="text-sm font-semibold mb-2">Activity</h2>
          <p className="text-xs text-stone-600">
            Later we can embed workspace analytics, dashboards, or activity logs.
          </p>
        </div>

        <div className="border rounded-md bg-white p-4">
          <h2 className="text-sm font-semibold mb-2">Channels</h2>
          <p className="text-xs text-stone-600">
            Once channels are tied to workspaces, this will show workspace channels.
          </p>
        </div>
      </section>
    </div>
  );
}

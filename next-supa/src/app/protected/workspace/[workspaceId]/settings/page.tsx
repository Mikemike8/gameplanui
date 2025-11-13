// src/app/protected/workspace/[workspaceId]/settings/page.tsx
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getOrCreateBackendUser, getWorkspace } from "@/lib/workspaces.ts";

interface WorkspaceSettingsPageProps {
  params: { workspaceId: string };
}

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect(
      `/auth/login?returnTo=/protected/workspace/${params.workspaceId}/settings`
    );
  }

  await getOrCreateBackendUser(session.user);
  const workspace = await getWorkspace(params.workspaceId);

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Settings – {workspace.name}
      </h1>
      <p className="text-sm text-stone-600">
        This is a placeholder for workspace settings (name, description,
        members, roles, etc). We can flesh this out once the core flows work.
      </p>
    </div>
  );
}
